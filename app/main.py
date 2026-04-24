"""Main entry point for the SIGRENE FastAPI application.

This module initializes the web server, handles the database connection
lifecycle, and defines the API routes (endpoints) for the frontend to consume.
"""

import os
from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, status, Query, Body, Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict, deque
from datetime import datetime, timedelta
import threading
from pydantic import BaseModel, EmailStr, Field

from app.database.mongodb import DatabaseClient
from app.models.schemas import (
    RegistroDiario, UsuarioCreate, UsuarioInDB, Token,
    RegistroDiarioResponse, RegistroDiarioListResponse, DashboardStats, EstilosNado,
    SesionCalculada,
    ControlFisiológico, ControlFisiológicoResponse,
    ComposicionCorporal, ComposicionCorporalResponse,
    AnalisisCompeticion, AnalisisCompeticionResponse,
    ACWRResponse, ListaResponse, UpdateResponse, DeleteResponse,
    NadadorCreate, NadadorUpdate, NadadorResponse,
    TrainingGroupCreate, TrainingGroupUpdate, TrainingGroupResponse
)
from app.services.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.calculations import calculate_session_metrics, calculate_acwr
from app.services.email.factory import get_email_service
from app.services.email.templates import (
    contact_form_notification,
    new_registration_notification,
    account_approved_email,
    account_rejected_email,
    registration_pending_email,
    password_recovery_email,
)


class SimpleRateLimiter:
    """Simple in-memory rate limiter per IP for login attempts."""

    def __init__(self, max_attempts: int = 5, window_seconds: int = 60):
        self.max_attempts = max_attempts
        self.window_seconds = window_seconds
        self._store: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def _clean_old(self, ip: str) -> None:
        cutoff = datetime.now() - timedelta(seconds=self.window_seconds)
        while self._store[ip] and self._store[ip][0] < cutoff:
            self._store[ip].popleft()

    def is_allowed(self, ip: str) -> bool:
        with self._lock:
            self._clean_old(ip)
            if len(self._store[ip]) >= self.max_attempts:
                return False
            self._store[ip].append(datetime.now())
            return True

    def remaining(self, ip: str) -> int:
        with self._lock:
            self._clean_old(ip)
            return max(0, self.max_attempts - len(self._store[ip]))

    def reset(self, ip: str) -> None:
        with self._lock:
            self._store[ip].clear()


login_limiter = SimpleRateLimiter(max_attempts=5, window_seconds=60)


def _sanitize_for_mongo(data: dict) -> dict:
    """Convert date objects to datetime for MongoDB storage."""
    result = {}
    for key, value in data.items():
        if isinstance(value, date) and not isinstance(value, datetime):
            result[key] = datetime.combine(value, datetime.min.time())
        elif isinstance(value, dict):
            result[key] = _sanitize_for_mongo(value)
        else:
            result[key] = value
    return result


def _check_swimmer_access(db, nadador_id: str, coach_id: str, user_role: str) -> bool:
    """Check if coach has access to swimmer. Returns True if access granted, False otherwise."""
    if user_role in ["admin_federacion", "superadmin"]:
        return True
    
    nadador = db["nadadores"].find_one({
        "$or": [{"pseudonym": nadador_id}, {"id_seudonimo": nadador_id}]
    })
    
    if not nadador:
        return False
    
    return nadador.get("coach_id") == coach_id


def _get_coach_swimmer_ids(db, coach_id: str, user_role: str) -> List[str]:
    """Get list of swimmer IDs that coach has access to."""
    if user_role in ["admin_federacion", "superadmin"]:
        swimmers = db["nadadores"].find({}, {"pseudonym": 1, "id_seudonimo": 1})
        return [s.get("pseudonym") or s["id_seudonimo"] for s in swimmers]
    
    swimmers = db["nadadores"].find(
        {"coach_id": coach_id},
        {"pseudonym": 1, "id_seudonimo": 1}
    )
    return [s.get("pseudonym") or s["id_seudonimo"] for s in swimmers]


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages the startup and shutdown events of the FastAPI application.

    Connects to MongoDB on startup, creates indexes, and safely disconnects on shutdown.
    """
    # Startup: Connect to MongoDB
    DatabaseClient.connect()
    
    # Create indexes for performance
    db = DatabaseClient.get_db()
    db["nadadores"].create_index("coach_id")
    db["nadadores"].create_index("fecha_nacimiento")
    db["nadadores"].create_index("is_archived")
    db["nadadores"].create_index("group_id")
    db["training_groups"].create_index("coach_id")
    db["registros_diarios"].create_index("nadador_id")
    db["controles_fisiologicos"].create_index("nadador_id")
    db["composicion_corporal"].create_index("nadador_id")
    db["analisis_competicion"].create_index("nadador_id")
    
    yield
    # Shutdown: Disconnect from MongoDB
    DatabaseClient.disconnect()


class OriginVerificationMiddleware(BaseHTTPMiddleware):
    """Middleware that blocks requests with disallowed Origin or Referer headers.

    This is a second layer of protection beyond CORS. CORS only applies to
    browser-based JavaScript requests. This middleware also blocks direct HTTP
    clients (curl, Postman, scripts) that don't send an allowed origin.

    The login endpoint (/login, /usuarios/registrar, /usuarios/recuperar) is
    always allowed so users can authenticate from any origin.
    """

    def __init__(self, app, allowed_origins: list[str]):
        super().__init__(app)
        self.allowed_origins = [o.rstrip("/") for o in allowed_origins]
        self.public_paths = {"/docs", "/openapi.json", "/redoc"}

    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin", "").rstrip("/")
        referer = request.headers.get("referer", "").rstrip("/")
        path = request.url.path

        # Public auth paths — always allow (login, register, recover password)
        public_auth_paths = (
            path.startswith("/api/v1/login") or
            path.startswith("/api/v1/usuarios/registrar") or
            path.startswith("/api/v1/usuarios/recuperar") or
            path.startswith("/api/v1/usuarios/reset-password") or
            path.startswith("/api/v1/logout") or
            path == "/docs" or
            path == "/openapi.json" or
            path == "/redoc"
        )
        if public_auth_paths:
            return await call_next(request)

        # If no origin/referer at all (e.g. curl with no headers), block in production
        env = os.environ.get("ENV", "development")
        if env == "production" and not origin and not referer:
            return JSONResponse(
                status_code=403,
                content={"detail": "Forbidden: origin header required"}
            )

        # Check if origin or referer matches an allowed origin
        effective_origin = origin or (referer.split("?")[0].rsplit("/", 1)[0] if referer else "")
        if effective_origin and effective_origin not in self.allowed_origins:
            return JSONResponse(
                status_code=403,
                content={"detail": "Forbidden: origin not allowed"}
            )

        return await call_next(request)


# Initialize the FastAPI application
_env = os.environ.get("ENV", "development")
_is_production = _env == "production"

app = FastAPI(
    title="SIGRENE API",
    description="Plataforma de Rendimiento y Optimización del Nadador de Élite",
    version="1.0.0",
    lifespan=lifespan,
    docs_url=None if _is_production else "/docs",
    redoc_url=None if _is_production else "/redoc",
)


_allowed_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
_allowed_list = [o.strip() for o in _allowed_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Second layer: verify origin header on every request (blocks curl/Postman in production)
if _is_production:
    app.add_middleware(OriginVerificationMiddleware, allowed_origins=_allowed_list)


@app.get("/api/v1/registros-diarios/", response_model=RegistroDiarioListResponse)
async def list_registros_diarios(
        skip: int = 0,
        limit: int = 20,
        nadador_id: Optional[str] = None,
        fecha_desde: Optional[date] = None,
        fecha_hasta: Optional[date] = None,
        current_user: dict = Depends(get_current_user)
):
    """List daily records with optional filtering and pagination.

    Args:
        skip: Number of records to skip (for pagination).
        limit: Maximum number of records to return (max 100).
        nadador_id: Filter by specific swimmer ID.
        fecha_desde: Filter records from this date (inclusive).
        fecha_hasta: Filter records up to this date (inclusive).
        current_user: Authenticated user.

    Returns:
        Paginated list of daily records with total count.
    """
    limit = min(limit, 100)
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    db = DatabaseClient.get_db()
    coleccion = db["registros_diarios"]

    query = {}
    
    # Access control: filter by coach's swimmers
    if user_role not in ["admin_federacion", "superadmin"] and not nadador_id:
        swimmer_ids = _get_coach_swimmer_ids(db, coach_id, user_role)
        if not swimmer_ids:
            return RegistroDiarioListResponse(total=0, skip=skip, limit=limit, registros=[])
        query["nadador_id"] = {"$in": swimmer_ids}

    if nadador_id:
        # Check access to specific swimmer
        if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, nadador_id, coach_id, user_role):
            raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")
        query["nadador_id"] = nadador_id

    if fecha_desde or fecha_hasta:
        fecha_query = {}
        if fecha_desde:
            fecha_query["$gte"] = datetime.combine(fecha_desde, datetime.min.time())
        if fecha_hasta:
            fecha_query["$lte"] = datetime.combine(fecha_hasta, datetime.min.time())
        query["fecha"] = fecha_query

    total = coleccion.count_documents(query)

    cursor = coleccion.find(query).sort("fecha", -1).skip(skip).limit(limit)

    registros = []
    for doc in cursor:
        registros.append(RegistroDiarioResponse(
            id=str(doc["_id"]),
            nadador_id=doc["nadador_id"],
            fecha=doc["fecha"].date() if isinstance(doc["fecha"], datetime) else doc["fecha"],
            entrenador_id=doc["entrenador_id"],
            registro_manana=doc.get("registro_manana"),
            sesion_entrenamiento=doc.get("sesion_entrenamiento"),
            created_at=doc.get("_id").generation_time if hasattr(doc["_id"], 'generation_time') else None
        ))

    return RegistroDiarioListResponse(
        total=total,
        skip=skip,
        limit=limit,
        registros=registros
    )


@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
        nadador_id: Optional[str] = None,
        current_user: dict = Depends(get_current_user)
):
    """Get aggregated statistics for the dashboard.

    Args:
        nadador_id: Filter by specific swimmer ID.
        current_user: Authenticated user.

    Returns:
        DashboardStats: Aggregated statistics including volume, sessions, styles, etc.
    """
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    db = DatabaseClient.get_db()
    coleccion = db["registros_diarios"]

    query = {}
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not nadador_id:
        swimmer_ids = _get_coach_swimmer_ids(db, coach_id, user_role)
        if not swimmer_ids:
            return DashboardStats()
        query["nadador_id"] = {"$in": swimmer_ids}
    
    if nadador_id:
        if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, nadador_id, coach_id, user_role):
            raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")
        query["nadador_id"] = nadador_id

    registros = list(coleccion.find(query))

    total_sesiones = 0
    volumen_total = 0
    duracion_total = 0
    volumen_semanal = 0
    sesiones_semanales = 0
    rpe_total = 0
    densidad_total = 0
    srpe_total = 0
    count_rpe = 0
    count_densidad = 0
    count_srpe = 0

    estilos_totales = {"libre": 0, "espalda": 0, "braza": 0, "mariposa": 0, "combinado": 0, "otros": 0}
    volumen_por_dia = {}
    actividad_mensual = {}

    week_start = datetime.now() - timedelta(days=7)

    for doc in registros:
        sesion = doc.get("sesion_entrenamiento", {})
        if sesion:
            total_sesiones += 1
            volumen = sesion.get("volumen_metros", 0)
            tiempo = sesion.get("tiempo_sesion_minutos", 0)
            volumen_total += volumen
            duracion_total += tiempo

            if sesion.get("rpe"):
                rpe_total += sesion["rpe"]
                count_rpe += 1
            if sesion.get("densidad"):
                densidad_total += sesion["densidad"]
                count_densidad += 1
            if sesion.get("srpe"):
                srpe_total += sesion["srpe"]
                count_srpe += 1

            estilos = sesion.get("estilos", {})
            for estilo, metros in estilos.items():
                if estilo in estilos_totales:
                    estilos_totales[estilo] += metros

            fecha = doc.get("fecha")
            if isinstance(fecha, datetime):
                fecha = fecha.date()

            if fecha:
                fecha_str = fecha.isoformat()
                volumen_por_dia[fecha_str] = volumen_por_dia.get(fecha_str, 0) + volumen

                mes_key = fecha.strftime("%Y-%m")
                if mes_key not in actividad_mensual:
                    actividad_mensual[mes_key] = {"fecha": mes_key, "sesiones": 0, "volumen": 0}
                actividad_mensual[mes_key]["sesiones"] += 1
                actividad_mensual[mes_key]["volumen"] += volumen

                if isinstance(doc.get("fecha"), datetime) and doc["fecha"] >= week_start:
                    volumen_semanal += volumen
                    sesiones_semanales += 1

    volumen_por_dia_list = [
        {"fecha": k, "volumen": v}
        for k, v in sorted(volumen_por_dia.items())
    ]

    actividad_mensual_list = [
        {"fecha": v["fecha"], "sesiones": v["sesiones"], "volumen": v["volumen"]}
        for v in sorted(actividad_mensual.values(), key=lambda x: x["fecha"])
    ]

    return DashboardStats(
        total_sesiones=total_sesiones,
        volumen_total=volumen_total,
        duracion_total=duracion_total,
        volumen_semanal=volumen_semanal,
        sesiones_semanales=sesiones_semanales,
        rpe_promedio=round(rpe_total / count_rpe, 1) if count_rpe > 0 else 0.0,
        densidad_promedio=round(densidad_total / count_densidad, 1) if count_densidad > 0 else 0.0,
        srpe_promedio=round(srpe_total / count_srpe, 1) if count_srpe > 0 else 0.0,
        estilos_totales=EstilosNado(**estilos_totales),
        volumen_por_dia=volumen_por_dia_list,
        actividad_mensual=actividad_mensual_list
    )


@app.get("/api/v1/registros-diarios/{registro_id}", response_model=RegistroDiarioResponse)
async def get_registro_diario(
        registro_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Get a specific daily record by its ID.

    Args:
        registro_id: MongoDB document ID.
        current_user: Authenticated user.

    Returns:
        The daily record details.

    Raises:
        HTTPException: If the record is not found.
    """
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(registro_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de registro inválido")

    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    db = DatabaseClient.get_db()
    doc = db["registros_diarios"].find_one({"_id": obj_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, doc["nadador_id"], coach_id, user_role):
        raise HTTPException(status_code=403, detail="No tienes acceso a este registro")

    return RegistroDiarioResponse(
        id=str(doc["_id"]),
        nadador_id=doc["nadador_id"],
        fecha=doc["fecha"].date() if isinstance(doc["fecha"], datetime) else doc["fecha"],
        entrenador_id=doc["entrenador_id"],
        registro_manana=doc.get("registro_manana"),
        sesion_entrenamiento=doc.get("sesion_entrenamiento"),
        created_at=doc.get("_id").generation_time if hasattr(doc["_id"], 'generation_time') else None
    )


@app.get("/api/v1/registros-diarios/nadador/{nadador_id}", response_model=RegistroDiarioListResponse)
async def get_registros_by_nadador(
        nadador_id: str,
        skip: int = 0,
        limit: int = 20,
        current_user: dict = Depends(get_current_user)
):
    """Get all daily records for a specific swimmer.

    Args:
        nadador_id: The swimmer's pseudonymized ID.
        skip: Number of records to skip (for pagination).
        limit: Maximum number of records to return (max 100).
        current_user: Authenticated user.

    Returns:
        Paginated list of daily records for the swimmer.
    """
    limit = min(limit, 100)
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    db = DatabaseClient.get_db()

    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, nadador_id, coach_id, user_role):
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    coleccion = db["registros_diarios"]

    query = {"nadador_id": nadador_id}
    total = coleccion.count_documents(query)

    cursor = coleccion.find(query).sort("fecha", -1).skip(skip).limit(limit)

    registros = []
    for doc in cursor:
        registros.append(RegistroDiarioResponse(
            id=str(doc["_id"]),
            nadador_id=doc["nadador_id"],
            fecha=doc["fecha"].date() if isinstance(doc["fecha"], datetime) else doc["fecha"],
            entrenador_id=doc["entrenador_id"],
            registro_manana=doc.get("registro_manana"),
            sesion_entrenamiento=doc.get("sesion_entrenamiento"),
            created_at=doc.get("_id").generation_time if hasattr(doc["_id"], 'generation_time') else None
        ))

    return RegistroDiarioListResponse(
        total=total,
        skip=skip,
        limit=limit,
        registros=registros
    )


@app.post("/api/v1/registros-diarios/", status_code=201)
async def create_registro_diario(
        registro: RegistroDiario,
        current_user: dict = Depends(get_current_user)
):
    try:
        coach_id = current_user.get("sub")
        user_role = current_user.get("rol", "coach")

        # Access control
        if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(
            DatabaseClient.get_db(), registro.nadador_id, coach_id, user_role
        ):
            raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

        print(f"El usuario {current_user['sub']} está guardando un entrenamiento.")

        registro_dict = registro.model_dump(exclude_none=True)
        calculos = None

        if registro.sesion_entrenamiento:
            calculos = calculate_session_metrics(registro.sesion_entrenamiento)
            registro_dict["sesion_entrenamiento"].update(calculos)

        registro_dict["fecha"] = datetime.combine(registro_dict["fecha"], datetime.min.time())

        db = DatabaseClient.get_db()
        result = db["registros_diarios"].insert_one(registro_dict)

        return {
            "message": "Registro guardado correctamente",
            "inserted_id": str(result.inserted_id),
            "calculos_aplicados": calculos
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@app.post("/api/v1/usuarios/registrar", status_code=status.HTTP_201_CREATED)
async def registrar_usuario(usuario: UsuarioCreate):
    """Registers a new user in the platform.

    Validates that the email is not already in use, hashes the password
    securely, and stores the user profile in MongoDB.

    Los roles admin_federacion quedan pendientes de aprobación por un superadmin.
    Los roles coach y swimmer se approved automáticamente.

    Args:
        usuario (UsuarioCreate): The user data including the plain password.

    Returns:
        dict: A success message.

    Raises:
        HTTPException: If the email is already registered.
    """
    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    # 1. Check if user already exists
    if coleccion_usuarios.find_one({"email": usuario.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado en SIGRENE"
        )

    # 2. Hash the password
    hashed_pwd = get_password_hash(usuario.password)

    # 3. All registrations are pending approval by superadmin
    estado = "pendiente"

    # 4. Prepare the DB document (exclude plain password, include hashed)
    usuario_db = UsuarioInDB(
        email=usuario.email,
        nombre_completo=usuario.nombre_completo,
        rol=usuario.rol,
        nadadores_asignados=usuario.nadadores_asignados,
        hashed_password=hashed_pwd,
        estado_aprobacion=estado,
        fecha_registro=datetime.utcnow()
    )

    # 5. Insert into MongoDB
    coleccion_usuarios.insert_one(usuario_db.model_dump())

    admin_email = os.environ.get("ADMIN_EMAIL", "admin@sigrene.es")

    try:
        email_service = get_email_service()
        await email_service.send(registration_pending_email(
            email=usuario.email,
            name=usuario.nombre_completo,
            user_role=usuario.rol,
        ))
        await email_service.send(new_registration_notification(
            user_email=usuario.email,
            user_name=usuario.nombre_completo,
            user_role=usuario.rol,
            admin_email=admin_email,
        ))
    except Exception as e:
        print(f"[WARNING] Failed to send registration email: {e}")

    return {
        "message": f"El usuario {usuario.email} ha sido registrado. Su cuenta está pendiente de aprobación por un administrador.",
        "estado_aprobacion": estado
    }


class UsuarioResponse(BaseModel):
    email: str
    nombre_completo: str
    rol: str
    nadadores_asignados: List[str]
    activo: bool
    estado_aprobacion: str
    aprobado_por: Optional[str] = None
    fecha_aprobacion: Optional[datetime] = None
    fecha_registro: Optional[datetime] = None
    created_at: Optional[datetime] = None


class UsuarioListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    datos: List[UsuarioResponse]


@app.get("/api/v1/usuarios/", response_model=UsuarioListResponse)
async def list_usuarios(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    rol: Optional[str] = Query(default=None, description="Filtrar por rol"),
    estado_aprobacion: Optional[str] = Query(default=None, description="Filtrar por estado de aprobación"),
    current_user: dict = Depends(get_current_user)
):
    """List all users (superadmin only).

    Returns a paginated list of all users in the system.
    Only accessible by superadmin users.
    """
    if current_user.get("rol") not in ["admin_federacion", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden ver la lista de usuarios"
        )

    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    query = {}
    if rol:
        query["rol"] = rol
    if estado_aprobacion:
        query["estado_aprobacion"] = estado_aprobacion

    total = coleccion_usuarios.count_documents(query)
    cursor = coleccion_usuarios.find(query, {"hashed_password": 0}).skip(skip).limit(limit)
    
    usuarios = []
    for doc in cursor:
        usuarios.append(UsuarioResponse(
            email=doc["email"],
            nombre_completo=doc["nombre_completo"],
            rol=doc["rol"],
            nadadores_asignados=doc.get("nadadores_asignados", []),
            activo=doc.get("activo", True),
            estado_aprobacion=doc.get("estado_aprobacion", "aprobado"),
            aprobado_por=doc.get("aprobado_por"),
            fecha_aprobacion=doc.get("fecha_aprobacion"),
            fecha_registro=doc.get("fecha_registro"),
            created_at=doc.get("created_at")
        ))

    return UsuarioListResponse(
        total=total,
        skip=skip,
        limit=limit,
        datos=usuarios
    )


@app.get("/api/v1/admin/registros-pendientes", response_model=UsuarioListResponse)
async def list_registros_pendientes(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    current_user: dict = Depends(get_current_user)
):
    """List all pending registrations (superadmin only).

    Returns a paginated list of users with estado_aprobacion = 'pendiente'.
    Only accessible by superadmin users.
    """
    if current_user.get("rol") not in ["admin_federacion", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden ver los registros pendientes"
        )

    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    query = {"estado_aprobacion": "pendiente"}
    total = coleccion_usuarios.count_documents(query)
    cursor = coleccion_usuarios.find(query, {"hashed_password": 0}).skip(skip).limit(limit)
    
    usuarios = []
    for doc in cursor:
        usuarios.append(UsuarioResponse(
            email=doc["email"],
            nombre_completo=doc["nombre_completo"],
            rol=doc["rol"],
            nadadores_asignados=doc.get("nadadores_asignados", []),
            activo=doc.get("activo", True),
            estado_aprobacion=doc.get("estado_aprobacion", "pendiente"),
            aprobado_por=doc.get("aprobado_por"),
            fecha_aprobacion=doc.get("fecha_aprobacion"),
            fecha_registro=doc.get("fecha_registro"),
            created_at=doc.get("created_at")
        ))

    return UsuarioListResponse(
        total=total,
        skip=skip,
        limit=limit,
        datos=usuarios
    )


@app.post("/api/v1/admin/aprobar/{email}", response_model=UpdateResponse)
async def aprobar_usuario(
    email: str,
    current_user: dict = Depends(get_current_user)
):
    """Approve a pending user registration (superadmin only).

    Changes the user's estado_aprobacion from 'pendiente' to 'aprobado'.
    Only accessible by superadmin users.
    """
    if current_user.get("rol") not in ["admin_federacion", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden aprobar registros"
        )

    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    # Find the user
    usuario = coleccion_usuarios.find_one({"email": email})
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el usuario con email {email}"
        )

    if usuario.get("estado_aprobacion") != "pendiente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario {email} no está pendiente de aprobación"
        )

    # Update the user
    result = coleccion_usuarios.update_one(
        {"email": email},
        {
            "$set": {
                "estado_aprobacion": "aprobado",
                "aprobado_por": current_user.get("email"),
                "fecha_aprobacion": datetime.utcnow()
            }
        }
    )

    try:
        email_service = get_email_service()
        await email_service.send(account_approved_email(
            email=email,
            name=usuario.get("nombre_completo", ""),
        ))
    except Exception as e:
        print(f"[WARNING] Failed to send approval email: {e}")

    return UpdateResponse(
        message=f"Usuario {email} aprobado correctamente",
        modified_count=result.modified_count
    )


@app.post("/api/v1/admin/rechazar/{email}", response_model=UpdateResponse)
async def rechazar_usuario(
    email: str,
    current_user: dict = Depends(get_current_user)
):
    """Reject a pending user registration (superadmin only).

    Changes the user's estado_aprobacion from 'pendiente' to 'rechazado'.
    Only accessible by superadmin users.
    """
    if current_user.get("rol") not in ["admin_federacion", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden rechazar registros"
        )

    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    # Find the user
    usuario = coleccion_usuarios.find_one({"email": email})
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No se encontró el usuario con email {email}"
        )

    if usuario.get("estado_aprobacion") != "pendiente":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El usuario {email} no está pendiente de aprobación"
        )

    # Update the user
    result = coleccion_usuarios.update_one(
        {"email": email},
        {
            "$set": {
                "estado_aprobacion": "rechazado",
                "aprobado_por": current_user.get("email"),
                "fecha_aprobacion": datetime.utcnow()
            }
        }
    )

    try:
        email_service = get_email_service()
        await email_service.send(account_rejected_email(
            email=email,
            name=usuario.get("nombre_completo", ""),
        ))
    except Exception as e:
        print(f"[WARNING] Failed to send rejection email: {e}")

    return UpdateResponse(
        message=f"Usuario {email} rechazado correctamente",
        modified_count=result.modified_count
    )


@app.put("/api/v1/usuarios/{email}", response_model=UpdateResponse)
async def update_usuario(
    email: str,
    update_data: dict,
    current_user: dict = Depends(get_current_user)
):
    """Update a user's role or status (admin only).

    Allows admin to change user roles or deactivate users.
    """
    if current_user.get("rol") not in ["admin_federacion", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden modificar usuarios"
        )

    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    # Build update document (only allow specific fields to be updated)
    allowed_fields = {"rol", "activo", "nombre_completo", "nadadores_asignados"}
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}

    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionaron campos válidos para actualizar"
        )

    result = coleccion_usuarios.update_one(
        {"email": email},
        {"$set": update_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return UpdateResponse(
        message=f"Usuario {email} actualizado correctamente",
        modified_count=result.modified_count
    )


@app.delete("/api/v1/usuarios/{email}", response_model=DeleteResponse)
async def delete_usuario(
    email: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a user completely from the database (admin only).

    This is a hard delete - the user will be permanently removed.
    """
    if current_user.get("rol") not in ["admin_federacion", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo los administradores pueden eliminar usuarios"
        )

    # Prevent admin from deleting themselves
    if current_user.get("sub") == email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes eliminarte a ti mismo"
        )

    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    result = coleccion_usuarios.delete_one({"email": email})

    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return DeleteResponse(
        message=f"Usuario {email} eliminado correctamente",
        deleted_count=result.deleted_count
    )


@app.get("/api/v1/me")
async def get_mi_perfil(current_user: dict = Depends(get_current_user)):
    """Get current user's profile."""
    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]
    
    usuario = coleccion_usuarios.find_one(
        {"email": current_user.get("sub")},
        {"hashed_password": 0}
    )
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return {
        "email": usuario["email"],
        "nombre_completo": usuario.get("nombre_completo", ""),
        "rol": usuario["rol"],
        "nadadores_asignados": usuario.get("nadadores_asignados", []),
        "activo": usuario.get("activo", True),
        "foto_perfil": usuario.get("foto_perfil"),
    }


@app.put("/api/v1/me")
async def update_mi_perfil(
    update_data: dict = Body(...),
    current_user: dict = Depends(get_current_user)
):
    """Update current user's profile (name, password)."""
    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]
    
    allowed_fields = {"nombre_completo", "foto_perfil", "password"}
    update_dict = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se proporcionaron campos válidos. Datos recibidos: {update_data}, keys: {list(update_data.keys()) if isinstance(update_data, dict) else type(update_data)}"
        )
    
    # Handle password change separately
    if "password" in update_dict:
        hashed_pwd = get_password_hash(update_dict.pop("password"))
        coleccion_usuarios.update_one(
            {"email": current_user.get("sub")},
            {"$set": {"hashed_password": hashed_pwd}}
        )
    
    # Update other fields
    if update_dict:
        coleccion_usuarios.update_one(
            {"email": current_user.get("sub")},
            {"$set": update_dict}
        )
    
    return {"message": "Perfil actualizado correctamente"}


@app.post("/api/v1/login")
async def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticates a user and returns a JWT access token.

    Verifies the provided email and password against the MongoDB database.
    If valid, generates a signed JWT containing the user's email and role.
    Users with estado_aprobacion 'pendiente' or 'rechazado' cannot login.

    Sets a httpOnly cookie for session management (RGPD compliant).

    Rate limited to 5 attempts per minute per IP to prevent brute force attacks.

    Args:
        form_data (OAuth2PasswordRequestForm): Standard OAuth2 form containing
            'username' (which we use for email) and 'password'.

    Returns:
        JSON with access_token and token_type.

    Raises:
        HTTPException: If authentication fails (wrong email or password) or
            if the user is not approved.
    """
    client_ip = request.client.host if request.client else "unknown"
    if not login_limiter.is_allowed(client_ip):
        remaining = login_limiter.remaining(client_ip)
        return JSONResponse(
            status_code=429,
            content={
                "detail": f"Demasiados intentos de login. Prueba de nuevo en un minuto. Intentos restantes: {remaining}"
            },
            headers={"Retry-After": "60", "X-RateLimit-Remaining": str(remaining)}
        )

    db = DatabaseClient.get_db()

    # 1. Find user by email (OAuth2 uses the field 'username' by default)
    usuario_db = db["usuarios"].find_one({"email": form_data.username})

    # 2. Verify existence and password match
    if not usuario_db or not verify_password(form_data.password, usuario_db["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Check approval status
    estado = usuario_db.get("estado_aprobacion", "aprobado")
    if estado == "pendiente":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta está pendiente de aprobación por un administrador.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if estado == "rechazado":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tu cuenta ha sido rechazada. Contacta con un administrador.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Generate the JWT Token
    access_token = create_access_token(
        data={"sub": usuario_db["email"], "rol": usuario_db["rol"]}
    )

    # 5. Set httpOnly cookie for session management
    login_limiter.reset(client_ip)
    response = JSONResponse(content={"access_token": access_token, "token_type": "bearer"})
    response.set_cookie(
        key="sigrene_session",
        value=access_token,
        max_age=60 * 60 * 24 * 30,  # 30 days
        httponly=True,
        secure=True,
        samesite="lax",
    )
    return response


@app.post("/api/v1/logout")
async def logout():
    """Logs out the user by clearing the session cookie."""
    response = JSONResponse(content={"message": "Sesión cerrada correctamente"})
    response.delete_cookie(key="sigrene_session")
    return response


class ContactFormRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    subject: str = Field(..., min_length=5, max_length=200)
    message: str = Field(..., min_length=10, max_length=5000)


@app.post("/api/v1/contacto")
async def submit_contact_form(form: ContactFormRequest):
    """Submit a contact form message.

    Sends an email to the admin with the contact form contents.
    This endpoint is public (no authentication required).

    Args:
        form: Contact form data.

    Returns:
        dict: Success message.
    """
    try:
        email_service = get_email_service()
        await email_service.send(contact_form_notification(
            name=form.name,
            email=form.email,
            subject=form.subject,
            message=form.message,
        ))
    except Exception as e:
        print(f"[WARNING] Failed to send contact form email: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_BAD_REQUEST,
            detail="Error al enviar el mensaje. Inténtalo de nuevo más tarde."
        )

    return {"message": "Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto."}


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class PasswordResetRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)
    confirm_password: str = Field(..., min_length=8)


@app.post("/api/v1/usuarios/recuperar")
async def request_password_recovery(request: PasswordRecoveryRequest):
    """Request password recovery email.

    Args:
        request: Email address of the user requesting recovery.

    Returns:
        dict: Success message.
    """
    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    usuario = coleccion_usuarios.find_one({"email": request.email})

    if not usuario:
        return {"message": "Si el email existe en nuestra base de datos, recibirás un correo con las instrucciones para restablecer tu contraseña."}

    estado = usuario.get("estado_aprobacion", "aprobado")
    if estado != "aprobado":
        return {"message": "Si el email existe en nuestra base de datos, recibirás un correo con las instrucciones para restablecer tu contraseña."}

    reset_token = create_access_token(
        data={"sub": usuario["email"], "type": "password_reset"},
        expires_delta=timedelta(minutes=30)
    )

    frontend_url = os.environ.get("FRONTEND_URL", "https://sigrene.vercel.app")
    reset_url = f"{frontend_url}/reset-password?token={reset_token}"

    try:
        email_service = get_email_service()
        await email_service.send(password_recovery_email(
            email=request.email,
            reset_url=reset_url,
            expires_minutes=30,
        ))
    except Exception as e:
        print(f"[WARNING] Failed to send password recovery email: {e}")

    return {"message": "Si el email existe en nuestra base de datos, recibirás un correo con las instrucciones para restablecer tu contraseña."}


@app.post("/api/v1/usuarios/reset-password")
async def reset_password(request: PasswordResetRequest):
    """Reset password using a recovery token.

    Args:
        request: Token, new password and confirmation.

    Returns:
        dict: Success message.

    Raises:
        HTTPException: If tokens don't match or are invalid.
    """
    from app.services.auth import decode_token

    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Las contraseñas no coinciden"
        )

    try:
        token_data = decode_token(request.token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )

    if token_data.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token no válido para recuperación de contraseña"
        )

    db = DatabaseClient.get_db()
    coleccion_usuarios = db["usuarios"]

    hashed_pwd = get_password_hash(request.new_password)

    result = coleccion_usuarios.update_one(
        {"email": token_data["sub"]},
        {"$set": {"hashed_password": hashed_pwd}}
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    return {"message": "Contraseña actualizada correctamente."}


@app.post("/api/v1/controles-fisiologicos/", status_code=201)
async def create_control_fisiologico(
        control: ControlFisiológico,
        current_user: dict = Depends(get_current_user)
):
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(
        DatabaseClient.get_db(), control.nadador_id, coach_id, user_role
    ):
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    db = DatabaseClient.get_db()
    control_dict = _sanitize_for_mongo(control.model_dump(exclude_none=True))

    if control_dict.get("cortisol_ugdl") and control_dict.get("testosterona_ngdl"):
        control_dict["ratio_cortisol_testo"] = round(
            control_dict["cortisol_ugdl"] / control_dict["testosterona_ngdl"], 4
        )

    result = db["controles_fisiologicos"].insert_one(control_dict)
    return {"message": "Control fisiológico registrado", "inserted_id": str(result.inserted_id)}


@app.get("/api/v1/controles-fisiologicos/", response_model=ListaResponse)
async def list_controles_fisiologicos(
        skip: int = 0,
        limit: int = 20,
        nadador_id: Optional[str] = None,
        current_user: dict = Depends(get_current_user)
):
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    db = DatabaseClient.get_db()
    query = {}
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not nadador_id:
        swimmer_ids = _get_coach_swimmer_ids(db, coach_id, user_role)
        if not swimmer_ids:
            return ListaResponse(total=0, skip=skip, limit=limit, datos=[])
        query["nadador_id"] = {"$in": swimmer_ids}
    
    if nadador_id:
        if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, nadador_id, coach_id, user_role):
            raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")
        query["nadador_id"] = nadador_id

    total = db["controles_fisiologicos"].count_documents(query)
    cursor = db["controles_fisiologicos"].find(query).sort("fecha", -1).skip(skip).limit(limit)

    controles = []
    for doc in cursor:
        controles.append(ControlFisiológicoResponse(
            id=str(doc["_id"]),
            nadador_id=doc["nadador_id"],
            fecha=doc["fecha"].date() if isinstance(doc["fecha"], datetime) else doc["fecha"],
            entrenador_id=doc["entrenador_id"],
            hrv_rmssd=doc.get("hrv_rmssd"),
            hrv_sdnn=doc.get("hrv_sdnn"),
            hrv_fc_reposo=doc.get("hrv_fc_reposo"),
            cmj_altura_cm=doc.get("cmj_altura_cm"),
            cmj_tiempo_contacto_ms=doc.get("cmj_tiempo_contacto_ms"),
            cmj_potencia_wkg=doc.get("cmj_potencia_wkg"),
            dominadas_num=doc.get("dominadas_num"),
            dominadas_kg_extra=doc.get("dominadas_kg_extra"),
            lactato_4mmol_velocidad=doc.get("lactato_4mmol_velocidad"),
            lactato_concentracion_mmol=doc.get("lactato_concentracion_mmol"),
            lactato_zona_test=doc.get("lactato_zona_test"),
            cortisol_ugdl=doc.get("cortisol_ugdl"),
            testosterona_ngdl=doc.get("testosterona_ngdl"),
            ratio_cortisol_testo=doc.get("ratio_cortisol_testo"),
            notas=doc.get("notas"),
            created_at=doc.get("_id").generation_time if hasattr(doc["_id"], 'generation_time') else None
        ))

    return ListaResponse(total=total, skip=skip, limit=limit, datos=controles)


@app.post("/api/v1/composicion-corporal/", status_code=201)
async def create_composicion_corporal(
        composicion: ComposicionCorporal,
        current_user: dict = Depends(get_current_user)
):
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(
        DatabaseClient.get_db(), composicion.nadador_id, coach_id, user_role
    ):
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    db = DatabaseClient.get_db()
    result = db["composicion_corporal"].insert_one(_sanitize_for_mongo(composicion.model_dump()))
    return {"message": "Composición corporal registrada", "inserted_id": str(result.inserted_id)}


@app.get("/api/v1/composicion-corporal/", response_model=ListaResponse)
async def list_composicion_corporal(
        skip: int = 0,
        limit: int = 20,
        nadador_id: Optional[str] = None,
        current_user: dict = Depends(get_current_user)
):
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    db = DatabaseClient.get_db()
    query = {}
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not nadador_id:
        swimmer_ids = _get_coach_swimmer_ids(db, coach_id, user_role)
        if not swimmer_ids:
            return ListaResponse(total=0, skip=skip, limit=limit, datos=[])
        query["nadador_id"] = {"$in": swimmer_ids}
    
    if nadador_id:
        if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, nadador_id, coach_id, user_role):
            raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")
        query["nadador_id"] = nadador_id

    total = db["composicion_corporal"].count_documents(query)
    cursor = db["composicion_corporal"].find(query).sort("fecha", -1).skip(skip).limit(limit)

    composiciones = []
    for doc in cursor:
        composiciones.append(ComposicionCorporalResponse(
            id=str(doc["_id"]),
            nadador_id=doc["nadador_id"],
            fecha=doc["fecha"].date() if isinstance(doc["fecha"], datetime) else doc["fecha"],
            entrenador_id=doc["entrenador_id"],
            altura_cm=doc.get("altura_cm"),
            peso_kg=doc.get("peso_kg"),
            altura_sentado_cm=doc.get("altura_sentado_cm"),
            envergadura_cm=doc.get("envergadura_cm"),
            longitud_pie_cm=doc.get("longitud_pie_cm"),
            longitud_mano_cm=doc.get("longitud_mano_cm"),
            distancia_biacromial_cm=doc.get("distancia_biacromial_cm"),
            masa_muscular_porc=doc.get("masa_muscular_porc"),
            masa_grasa_porc=doc.get("masa_grasa_porc"),
            masa_osea_kg=doc.get("masa_osea_kg"),
            hidratacion_porc=doc.get("hidratacion_porc"),
            notas=doc.get("notas"),
            created_at=doc.get("_id").generation_time if hasattr(doc["_id"], 'generation_time') else None
        ))

    return ListaResponse(total=total, skip=skip, limit=limit, datos=composiciones)


@app.post("/api/v1/analisis-competicion/", status_code=201)
async def create_analisis_competicion(
        analisis: AnalisisCompeticion,
        current_user: dict = Depends(get_current_user)
):
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(
        DatabaseClient.get_db(), analisis.nadador_id, coach_id, user_role
    ):
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    db = DatabaseClient.get_db()
    result = db["analisis_competicion"].insert_one(_sanitize_for_mongo(analisis.model_dump()))
    return {"message": "Análisis de competición registrado", "inserted_id": str(result.inserted_id)}


@app.get("/api/v1/analisis-competicion/", response_model=ListaResponse)
async def list_analisis_competicion(
        skip: int = 0,
        limit: int = 20,
        nadador_id: Optional[str] = None,
        prueba: Optional[str] = None,
        current_user: dict = Depends(get_current_user)
):
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    db = DatabaseClient.get_db()
    query = {}
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not nadador_id:
        swimmer_ids = _get_coach_swimmer_ids(db, coach_id, user_role)
        if not swimmer_ids:
            return ListaResponse(total=0, skip=skip, limit=limit, datos=[])
        query["nadador_id"] = {"$in": swimmer_ids}
    
    if nadador_id:
        if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, nadador_id, coach_id, user_role):
            raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")
        query["nadador_id"] = nadador_id
    
    if prueba:
        query["prueba"] = {"$regex": prueba, "$options": "i"}

    total = db["analisis_competicion"].count_documents(query)
    cursor = db["analisis_competicion"].find(query).sort("fecha", -1).skip(skip).limit(limit)

    analisis_list = []
    for doc in cursor:
        analisis_list.append(AnalisisCompeticionResponse(
            id=str(doc["_id"]),
            nadador_id=doc["nadador_id"],
            fecha=doc["fecha"].date() if isinstance(doc["fecha"], datetime) else doc["fecha"],
            entrenador_id=doc["entrenador_id"],
            nombre_competicion=doc["nombre_competicion"],
            prueba=doc["prueba"],
            estilo=doc["estilo"],
            tiempo_total_segundos=doc.get("tiempo_total_segundos"),
            ronda=doc.get("ronda"),
            posicion=doc.get("posicion"),
            parcial_1_25m=doc.get("parcial_1_25m"),
            parcial_2_50m=doc.get("parcial_2_50m"),
            parcial_3_75m=doc.get("parcial_3_75m"),
            parcial_4_100m=doc.get("parcial_4_100m"),
            parcial_5_125m=doc.get("parcial_5_125m"),
            parcial_6_150m=doc.get("parcial_6_150m"),
            parcial_7_175m=doc.get("parcial_7_175m"),
            parcial_8_200m=doc.get("parcial_8_200m"),
            parcial_salida_15m=doc.get("parcial_salida_15m"),
            parcial_viraje_10m=doc.get("parcial_viraje_10m"),
            parcial_subacuatico_dist_m=doc.get("parcial_subacuatico_dist_m"),
            parcial_subacuatico_velocidad=doc.get("parcial_subacuatico_velocidad"),
            sl_metros_ciclo=doc.get("sl_metros_ciclo"),
            sr_ciclos_minuto=doc.get("sr_ciclos_minuto"),
            indice_brazada=doc.get("indice_brazada"),
            velocidad_nado_mps=doc.get("velocidad_nado_mps"),
            drop_off_porc=doc.get("drop_off_porc"),
            notas=doc.get("notas"),
            created_at=doc.get("_id").generation_time if hasattr(doc["_id"], 'generation_time') else None
        ))

    return ListaResponse(total=total, skip=skip, limit=limit, datos=analisis_list)


@app.get("/api/v1/acwr/{nadador_id}", response_model=List[ACWRResponse])
async def get_acwr_history(
        nadador_id: str,
        semanas: int = 8,
        current_user: dict = Depends(get_current_user)
):
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    db = DatabaseClient.get_db()
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, nadador_id, coach_id, user_role):
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    coleccion = db["registros_diarios"]

    end_date = datetime.now()
    start_date = end_date - timedelta(weeks=semanas + 4)

    cursor = coleccion.find({
        "nadador_id": nadador_id,
        "fecha": {"$gte": start_date, "$lte": end_date}
    }).sort("fecha", 1)

    registros = list(cursor)

    weekly_data = {}
    for doc in registros:
        fecha = doc["fecha"]
        if isinstance(fecha, datetime):
            fecha = fecha.date()
        week_start = fecha - timedelta(days=fecha.weekday())
        week_key = week_start.isoformat()

        if week_key not in weekly_data:
            weekly_data[week_key] = {"srpe": 0, "volumen": 0, "sesiones": 0}

        sesion = doc.get("sesion_entrenamiento", {})
        if sesion:
            srpe = sesion.get("srpe") or (sesion.get("rpe", 0) * sesion.get("tiempo_sesion_minutos", 0))
            weekly_data[week_key]["srpe"] += srpe
            weekly_data[week_key]["volumen"] += sesion.get("volumen_metros", 0)
            weekly_data[week_key]["sesiones"] += 1

    weeks_sorted = sorted(weekly_data.keys())
    acwr_history = []

    for i, week_key in enumerate(weeks_sorted):
        if i < 3:
            continue

        acute_load = weekly_data[week_key]["srpe"]
        chronic_weeks = weeks_sorted[max(0, i-3):i]
        if len(chronic_weeks) < 3:
            continue

        chronic_loads = [weekly_data[w]["srpe"] for w in chronic_weeks]
        chronic_load = sum(chronic_loads) / len(chronic_loads)

        acwr = round(acute_load / chronic_load, 2) if chronic_load > 0 else 0.0

        if acwr < 0.8:
            status = "Low"
        elif acwr <= 1.3:
            status = "Optimal"
        elif acwr <= 1.5:
            status = "High Risk"
        else:
            status = "Very High Risk"

        acwr_history.append(ACWRResponse(
            nadador_id=nadador_id,
            fecha_semana=date.fromisoformat(week_key),
            acwr=acwr,
            status=status,
            carga_aguda=round(acute_load, 1),
            carga_cronica=round(chronic_load, 1),
            volumen_semanal=weekly_data[week_key]["volumen"],
            sesiones_semanales=weekly_data[week_key]["sesiones"]
        ))

    return acwr_history


# ==================== NADADORES ====================

def _generate_pseudonym(db, coach_id: str) -> str:
    """Generate a unique pseudonym in format NAD-YYYY-NNNN."""
    year = datetime.now().year
    prefix = f"NAD-{year}-"
    
    count = db["nadadores"].count_documents({
        "coach_id": coach_id,
        "pseudonym": {"$regex": f"^{prefix}"}
    })
    
    return f"{prefix}{(count + 1):04d}"


def _get_nadador_response(doc: dict, db) -> NadadorResponse:
    """Build a NadadorResponse from a MongoDB document, joining group_name."""
    group_name = None
    if doc.get("group_id"):
        group = db["training_groups"].find_one({"_id": doc["group_id"]})
        if group:
            group_name = group.get("name")
    
    return NadadorResponse(
        id_seudonimo=doc.get("pseudonym") or doc["id_seudonimo"],
        pseudonym=doc.get("pseudonym"),
        nombre=doc.get("nombre"),
        apellidos=doc.get("apellidos"),
        fecha_nacimiento=doc.get("fecha_nacimiento"),
        genero=doc.get("genero"),
        provincia=doc.get("provincia"),
        club=doc.get("club"),
        estilos=doc.get("estilos"),
        altura_cm=doc.get("altura_cm"),
        altura_sentado_cm=doc.get("altura_sentado_cm"),
        envergadura_cm=doc.get("envergadura_cm"),
        talla_pie_cm=doc.get("talla_pie_cm"),
        tamanio_mano_cm=doc.get("tamanio_mano_cm"),
        contacto_emergencia=doc.get("contacto_emergencia"),
        email_padres=doc.get("email_padres"),
        reportes_activos=doc.get("reportes_activos", False),
        coach_id=doc.get("coach_id"),
        group_id=doc.get("group_id"),
        group_name=group_name,
        is_archived=doc.get("is_archived", False),
        archived_at=doc.get("archived_at"),
        created_by=doc.get("created_by"),
        created_at=doc.get("created_at"),
        updated_by=doc.get("updated_by"),
        updated_at=doc.get("updated_at")
    )


@app.post("/api/v1/nadadores/", status_code=201)
async def create_nadador(
        nadador: NadadorCreate,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    pseudonym = nadador.pseudonym
    if not pseudonym:
        pseudonym = _generate_pseudonym(db, coach_id)
    else:
        if db["nadadores"].find_one({"pseudonym": pseudonym, "coach_id": coach_id}):
            raise HTTPException(status_code=400, detail="Ya existe un nadador con ese pseudónimo")
    
    # Use pseudonym as id_seudonimo for backwards compatibility
    nadador_dict = _sanitize_for_mongo(nadador.model_dump())
    nadador_dict["pseudonym"] = pseudonym
    nadador_dict["id_seudonimo"] = pseudonym  # Backwards compatibility
    nadador_dict["coach_id"] = coach_id
    nadador_dict["created_by"] = coach_id
    nadador_dict["updated_by"] = coach_id
    nadador_dict["created_at"] = datetime.utcnow()
    nadador_dict["updated_at"] = datetime.utcnow()
    nadador_dict["is_archived"] = False

    # Remove group_id from dict if None (to avoid MongoDB issues)
    if nadador_dict.get("group_id") is None:
        del nadador_dict["group_id"]

    result = db["nadadores"].insert_one(nadador_dict)
    return {"message": "Nadador creado", "id": str(result.inserted_id), "pseudonym": pseudonym}


@app.get("/api/v1/nadadores/", response_model=ListaResponse)
async def list_nadadores(
        skip: int = 0,
        limit: int = 100,
        group_id: Optional[str] = None,
        include_archived: bool = False,
        search: Optional[str] = None,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    query = {}
    
    # Access control: admin sees all, coaches see only their swimmers
    if user_role not in ["admin_federacion", "superadmin"]:
        query["coach_id"] = coach_id
    
    if not include_archived:
        query["is_archived"] = {"$ne": True}
    
    if group_id:
        query["group_id"] = group_id
    
    if search:
        query["$or"] = [
            {"nombre": {"$regex": search, "$options": "i"}},
            {"pseudonym": {"$regex": search, "$options": "i"}},
            {"apellidos": {"$regex": search, "$options": "i"}},
            {"id_seudonimo": {"$regex": search, "$options": "i"}}
        ]
    
    total = db["nadadores"].count_documents(query)
    cursor = db["nadadores"].find(query).sort("nombre", 1).skip(skip).limit(limit)

    nadadores = [_get_nadador_response(doc, db) for doc in cursor]

    return ListaResponse(total=total, skip=skip, limit=limit, datos=nadadores)


@app.get("/api/v1/nadadores/{nadador_id}", response_model=NadadorResponse)
async def get_nadador(
        nadador_id: str,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    doc = db["nadadores"].find_one({
        "$or": [
            {"pseudonym": nadador_id},
            {"id_seudonimo": nadador_id}
        ]
    })

    if not doc:
        raise HTTPException(status_code=404, detail="Nadador no encontrado")
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and doc.get("coach_id") != coach_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    return _get_nadador_response(doc, db)


@app.put("/api/v1/nadadores/{nadador_id}")
async def update_nadador(
        nadador_id: str,
        nadador: NadadorUpdate,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    existing = db["nadadores"].find_one({
        "$or": [
            {"pseudonym": nadador_id},
            {"id_seudonimo": nadador_id}
        ]
    })
    
    if not existing:
        raise HTTPException(status_code=404, detail="Nadador no encontrado")
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and existing.get("coach_id") != coach_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    update_data = _sanitize_for_mongo(nadador.model_dump(exclude_none=True))
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")

    update_data["updated_at"] = datetime.utcnow()
    update_data["updated_by"] = coach_id

    # Handle archive separately
    if "is_archived" in update_data:
        if update_data["is_archived"]:
            update_data["archived_at"] = datetime.utcnow()
        else:
            update_data["archived_at"] = None

    # Remove None group_id
    if update_data.get("group_id") is None:
        update_data["group_id"] = None

    result = db["nadadores"].update_one(
        {"_id": existing["_id"]},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Nadador no encontrado")

    return {"message": "Nadador actualizado", "modified_count": result.modified_count}


@app.delete("/api/v1/nadadores/{nadador_id}")
async def delete_nadador(
        nadador_id: str,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")
    
    existing = db["nadadores"].find_one({
        "$or": [
            {"pseudonym": nadador_id},
            {"id_seudonimo": nadador_id}
        ]
    })
    
    if not existing:
        raise HTTPException(status_code=404, detail="Nadador no encontrado")
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and existing.get("coach_id") != coach_id:
        raise HTTPException(status_code=403, detail="No tienes acceso a este nadador")

    # Check if swimmer has historical data
    has_records = (
        db["registros_diarios"].count_documents({"nadador_id": nadador_id}) > 0 or
        db["controles_fisiologicos"].count_documents({"nadador_id": nadador_id}) > 0
    )
    
    if has_records:
        # Soft delete instead of hard delete
        result = db["nadadores"].update_one(
            {"_id": existing["_id"]},
            {"$set": {
                "is_archived": True,
                "archived_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
                "updated_by": coach_id
            }}
        )
        return {"message": "Nadador archivado (tiene datos históricos)", "deleted_count": 0, "archived": True}
    
    # Hard delete only if no historical data
    result = db["nadadores"].delete_one({"_id": existing["_id"]})

    return {"message": "Nadador eliminado", "deleted_count": result.deleted_count}


# ==================== TRAINING GROUPS ====================

@app.get("/api/v1/grupos/", response_model=ListaResponse)
async def list_grupos(
        current_user: dict = Depends(get_current_user)
):
    """List training groups for the current coach."""
    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")
    
    query = {"coach_id": coach_id}
    total = db["training_groups"].count_documents(query)
    cursor = db["training_groups"].find(query).sort("name", 1)

    grupos = []
    for doc in cursor:
        grupos.append(TrainingGroupResponse(
            id=str(doc["_id"]),
            coach_id=doc["coach_id"],
            name=doc["name"],
            description=doc.get("description"),
            is_active=doc.get("is_active", True),
            created_at=doc.get("created_at"),
            updated_at=doc.get("updated_at")
        ))

    return ListaResponse(total=total, skip=0, limit=100, datos=grupos)


@app.post("/api/v1/grupos/", status_code=201)
async def create_grupo(
        grupo: TrainingGroupCreate,
        current_user: dict = Depends(get_current_user)
):
    """Create a new training group for the current coach."""
    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")
    
    grupo_dict = grupo.model_dump()
    grupo_dict["coach_id"] = coach_id
    grupo_dict["is_active"] = True
    grupo_dict["created_at"] = datetime.utcnow()
    grupo_dict["updated_at"] = datetime.utcnow()

    result = db["training_groups"].insert_one(grupo_dict)
    return {"message": "Grupo creado", "id": str(result.inserted_id)}


@app.put("/api/v1/grupos/{grupo_id}")
async def update_grupo(
        grupo_id: str,
        grupo: TrainingGroupUpdate,
        current_user: dict = Depends(get_current_user)
):
    """Update a training group (only if owned by current coach)."""
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(grupo_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de grupo inválido")

    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")

    update_data = grupo.model_dump(exclude_none=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")

    update_data["updated_at"] = datetime.utcnow()

    result = db["training_groups"].update_one(
        {"_id": obj_id, "coach_id": coach_id},
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Grupo no encontrado o no tienes permisos")

    return {"message": "Grupo actualizado", "modified_count": result.modified_count}


@app.delete("/api/v1/grupos/{grupo_id}")
async def delete_grupo(
        grupo_id: str,
        current_user: dict = Depends(get_current_user)
):
    """Delete a training group (only if owned by current coach).
    
    Note: This sets swimmers' group_id to null instead of actual deletion.
    """
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(grupo_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID de grupo inválido")

    db = DatabaseClient.get_db()
    coach_id = current_user.get("sub")

    result = db["training_groups"].delete_one({"_id": obj_id, "coach_id": coach_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Grupo no encontrado o no tienes permisos")

    # Set group_id to null for all swimmers in this group
    db["nadadores"].update_many(
        {"group_id": grupo_id, "coach_id": coach_id},
        {"$set": {"group_id": None, "updated_at": datetime.utcnow()}}
    )

    return {"message": "Grupo eliminado", "deleted_count": result.deleted_count}


# ==================== UPDATE/DELETE endpoints ====================

@app.put("/api/v1/registros-diarios/{registro_id}")
async def update_registro_diario(
        registro_id: str,
        registro: RegistroDiario,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(registro_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    registro_dict = registro.model_dump(exclude_none=True)
    calculos = None

    if registro.sesion_entrenamiento:
        calculos = calculate_session_metrics(registro.sesion_entrenamiento)
        registro_dict["sesion_entrenamiento"].update(calculos)

    registro_dict["fecha"] = datetime.combine(registro_dict["fecha"], datetime.min.time())
    registro_dict["updated_at"] = datetime.utcnow()

    db = DatabaseClient.get_db()
    result = db["registros_diarios"].update_one(
        {"_id": obj_id},
        {"$set": registro_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    return {"message": "Registro actualizado", "modified_count": result.modified_count}


@app.delete("/api/v1/registros-diarios/{registro_id}")
async def delete_registro_diario(
        registro_id: str,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(registro_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    coach_id = current_user.get("sub")
    user_role = current_user.get("rol", "coach")

    db = DatabaseClient.get_db()
    
    doc = db["registros_diarios"].find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    # Access control
    if user_role not in ["admin_federacion", "superadmin"] and not _check_swimmer_access(db, doc["nadador_id"], coach_id, user_role):
        raise HTTPException(status_code=403, detail="No tienes acceso a este registro")

    result = db["registros_diarios"].delete_one({"_id": obj_id})

    return {"message": "Registro eliminado", "deleted_count": result.deleted_count}


@app.put("/api/v1/controles-fisiologicos/{control_id}")
async def update_control_fisiologico(
        control_id: str,
        control: ControlFisiológico,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(control_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    control_dict = _sanitize_for_mongo(control.model_dump(exclude_none=True))

    if control_dict.get("cortisol_ugdl") and control_dict.get("testosterona_ngdl"):
        control_dict["ratio_cortisol_testo"] = round(
            control_dict["cortisol_ugdl"] / control_dict["testosterona_ngdl"], 4
        )

    control_dict["updated_at"] = datetime.utcnow()

    db = DatabaseClient.get_db()
    result = db["controles_fisiologicos"].update_one(
        {"_id": obj_id},
        {"$set": control_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Control no encontrado")

    return {"message": "Control actualizado", "modified_count": result.modified_count}


@app.delete("/api/v1/controles-fisiologicos/{control_id}")
async def delete_control_fisiologico(
        control_id: str,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(control_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    db = DatabaseClient.get_db()
    result = db["controles_fisiologicos"].delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Control no encontrado")

    return {"message": "Control eliminado", "deleted_count": result.deleted_count}


@app.put("/api/v1/composicion-corporal/{composicion_id}")
async def update_composicion_corporal(
        composicion_id: str,
        composicion: ComposicionCorporal,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(composicion_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    composicion_dict = _sanitize_for_mongo(composicion.model_dump(exclude_none=True))
    composicion_dict["updated_at"] = datetime.utcnow()

    db = DatabaseClient.get_db()
    result = db["composicion_corporal"].update_one(
        {"_id": obj_id},
        {"$set": composicion_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Composición no encontrada")

    return {"message": "Composición corporal actualizada", "modified_count": result.modified_count}


@app.delete("/api/v1/composicion-corporal/{composicion_id}")
async def delete_composicion_corporal(
        composicion_id: str,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(composicion_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    db = DatabaseClient.get_db()
    result = db["composicion_corporal"].delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Composición no encontrada")

    return {"message": "Composición corporal eliminada", "deleted_count": result.deleted_count}


@app.put("/api/v1/analisis-competicion/{analisis_id}")
async def update_analisis_competicion(
        analisis_id: str,
        analisis: AnalisisCompeticion,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(analisis_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    analisis_dict = _sanitize_for_mongo(analisis.model_dump(exclude_none=True))
    analisis_dict["updated_at"] = datetime.utcnow()

    db = DatabaseClient.get_db()
    result = db["analisis_competicion"].update_one(
        {"_id": obj_id},
        {"$set": analisis_dict}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")

    return {"message": "Análisis de competición actualizado", "modified_count": result.modified_count}


@app.delete("/api/v1/analisis-competicion/{analisis_id}")
async def delete_analisis_competicion(
        analisis_id: str,
        current_user: dict = Depends(get_current_user)
):
    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        obj_id = ObjectId(analisis_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="ID inválido")

    db = DatabaseClient.get_db()
    result = db["analisis_competicion"].delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")

    return {"message": "Análisis de competición eliminado", "deleted_count": result.deleted_count}