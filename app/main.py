"""Main entry point for the SIGRENE FastAPI application.

This module initializes the web server, handles the database connection
lifecycle, and defines the API routes (endpoints) for the frontend to consume.
"""

from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field

from app.database.mongodb import DatabaseClient
from app.models.schemas import RegistroDiario, UsuarioCreate, UsuarioInDB, Token, RegistroDiarioResponse, RegistroDiarioListResponse, DashboardStats, EstilosNado
from app.services.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.calculations import calculate_session_metrics


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manages the startup and shutdown events of the FastAPI application.

    Connects to MongoDB on startup and safely disconnects on shutdown.
    """
    # Startup: Connect to MongoDB
    DatabaseClient.connect()
    yield
    # Shutdown: Disconnect from MongoDB
    DatabaseClient.disconnect()


# Initialize the FastAPI application
app = FastAPI(
    title="SIGRENE API",
    description="Plataforma de Rendimiento y Optimización del Nadador de Élite",
    version="1.0.0",
    lifespan=lifespan
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite peticiones desde cualquier origen (ideal para pruebas locales)
    allow_credentials=True,
    allow_methods=["*"],  # Permite POST, GET, OPTIONS, etc.
    allow_headers=["*"],
)


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

    db = DatabaseClient.get_db()
    coleccion = db["registros_diarios"]

    query = {}

    if nadador_id:
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
    db = DatabaseClient.get_db()
    coleccion = db["registros_diarios"]

    query = {}
    if nadador_id:
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

    db = DatabaseClient.get_db()
    doc = db["registros_diarios"].find_one({"_id": obj_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

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

    db = DatabaseClient.get_db()
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
        # Podemos incluso imprimir en consola quién está guardando el dato
        print(f"El usuario {current_user['sub']} está guardando un entrenamiento.")

        # ... (Aquí sigue exactamente el mismo código que ya tenías dentro del try) ...
        registro_dict = registro.model_dump(exclude_none=True)
        metrics = None

        if registro.sesion_entrenamiento:
            metrics = calculate_session_metrics(registro.sesion_entrenamiento)
            registro_dict["sesion_entrenamiento"].update(metrics)

        registro_dict["fecha"] = datetime.combine(registro_dict["fecha"], datetime.min.time())

        db = DatabaseClient.get_db()
        result = db["registros_diarios"].insert_one(registro_dict)

        return {
            "message": "Registro guardado correctamente",
            "inserted_id": str(result.inserted_id),
            "calculos_aplicados": metrics
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")


@app.post("/api/v1/usuarios/registrar", status_code=status.HTTP_201_CREATED)
async def registrar_usuario(usuario: UsuarioCreate):
    """Registers a new user in the platform.

    Validates that the email is not already in use, hashes the password
    securely, and stores the user profile in MongoDB.

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

    # 3. Prepare the DB document (exclude plain password, include hashed)
    usuario_db = UsuarioInDB(
        email=usuario.email,
        nombre_completo=usuario.nombre_completo,
        rol=usuario.rol,
        nadadores_asignados=usuario.nadadores_asignados,
        hashed_password=hashed_pwd
    )

    # 4. Insert into MongoDB
    coleccion_usuarios.insert_one(usuario_db.model_dump())

    return {"message": f"Usuario {usuario.email} registrado correctamente."}


@app.post("/api/v1/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    """Authenticates a user and returns a JWT access token.

    Verifies the provided email and password against the MongoDB database.
    If valid, generates a signed JWT containing the user's email and role.

    Args:
        form_data (OAuth2PasswordRequestForm): Standard OAuth2 form containing
            'username' (which we use for email) and 'password'.

    Returns:
        Token: The JWT access token and token type.

    Raises:
        HTTPException: If authentication fails (wrong email or password).
    """
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

    # 3. Generate the JWT Token
    access_token = create_access_token(
        data={"sub": usuario_db["email"], "rol": usuario_db["rol"]}
    )

    return {"access_token": access_token, "token_type": "bearer"}


class PasswordRecoveryRequest(BaseModel):
    email: EmailStr


class PasswordResetRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


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

    reset_token = create_access_token(
        data={"sub": usuario["email"], "type": "password_reset"},
        expires_delta=timedelta(minutes=30)
    )

    print(f"[DEBUG] Token de recuperación para {request.email}: {reset_token}")

    return {"message": "Si el email existe en nuestra base de datos, recibirás un correo con las instrucciones para restablecer tu contraseña."}


@app.post("/api/v1/usuarios/reset-password")
async def reset_password(request: PasswordResetRequest):
    """Reset password using a recovery token.

    Args:
        request: Token and new password.

    Returns:
        dict: Success message.
    """
    from app.services.auth import decode_token

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