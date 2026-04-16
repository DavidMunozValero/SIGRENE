"""Main entry point for the SIGRENE FastAPI application.

This module initializes the web server, handles the database connection
lifecycle, and defines the API routes (endpoints) for the frontend to consume.
"""

from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
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
    NadadorCreate, NadadorUpdate, NadadorResponse
)
from app.services.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.calculations import calculate_session_metrics, calculate_acwr


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


@app.post("/api/v1/controles-fisiologicos/", status_code=201)
async def create_control_fisiologico(
        control: ControlFisiológico,
        current_user: dict = Depends(get_current_user)
):
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
    db = DatabaseClient.get_db()
    query = {}
    if nadador_id:
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
    db = DatabaseClient.get_db()
    query = {}
    if nadador_id:
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
    db = DatabaseClient.get_db()
    query = {}
    if nadador_id:
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
    db = DatabaseClient.get_db()
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

@app.post("/api/v1/nadadores/", status_code=201)
async def create_nadador(
        nadador: NadadorCreate,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    if db["nadadores"].find_one({"id_seudonimo": nadador.id_seudonimo}):
        raise HTTPException(status_code=400, detail="Ya existe un nadador con ese ID")

    nadador_dict = _sanitize_for_mongo(nadador.model_dump())
    nadador_dict["created_at"] = datetime.utcnow()
    nadador_dict["updated_at"] = datetime.utcnow()

    result = db["nadadores"].insert_one(nadador_dict)
    return {"message": "Nadador creado", "id": str(result.inserted_id)}


@app.get("/api/v1/nadadores/", response_model=ListaResponse)
async def list_nadadores(
        skip: int = 0,
        limit: int = 100,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    total = db["nadadores"].count_documents({})
    cursor = db["nadadores"].find({}).sort("nombre", 1).skip(skip).limit(limit)

    nadadores = []
    for doc in cursor:
        nadadores.append(NadadorResponse(
            id_seudonimo=doc["id_seudonimo"],
            nombre=doc["nombre"],
            fecha_nacimiento=doc.get("fecha_nacimiento"),
            genero=doc.get("genero"),
            club=doc.get("club"),
            provincia=doc.get("provincia"),
            fecha_alta=doc.get("fecha_alta"),
            entrenador_principal=doc.get("entrenador_principal"),
            telefono_emergencia=doc.get("telefono_emergencia"),
            observaciones=doc.get("observaciones"),
            created_at=doc.get("created_at"),
            updated_at=doc.get("updated_at")
        ))

    return ListaResponse(total=total, skip=skip, limit=limit, datos=nadadores)


@app.get("/api/v1/nadadores/{nadador_id}", response_model=NadadorResponse)
async def get_nadador(
        nadador_id: str,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    doc = db["nadadores"].find_one({"id_seudonimo": nadador_id})

    if not doc:
        raise HTTPException(status_code=404, detail="Nadador no encontrado")

    return NadadorResponse(
        id_seudonimo=doc["id_seudonimo"],
        nombre=doc["nombre"],
        fecha_nacimiento=doc.get("fecha_nacimiento"),
        genero=doc.get("genero"),
        club=doc.get("club"),
        provincia=doc.get("provincia"),
        fecha_alta=doc.get("fecha_alta"),
        entrenador_principal=doc.get("entrenador_principal"),
        telefono_emergencia=doc.get("telefono_emergencia"),
        observaciones=doc.get("observaciones"),
        created_at=doc.get("created_at"),
        updated_at=doc.get("updated_at")
    )


@app.put("/api/v1/nadadores/{nadador_id}")
async def update_nadador(
        nadador_id: str,
        nadador: NadadorUpdate,
        current_user: dict = Depends(get_current_user)
):
    db = DatabaseClient.get_db()
    update_data = _sanitize_for_mongo(nadador.model_dump(exclude_none=True))
    if not update_data:
        raise HTTPException(status_code=400, detail="No hay datos para actualizar")

    update_data["updated_at"] = datetime.utcnow()

    result = db["nadadores"].update_one(
        {"id_seudonimo": nadador_id},
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
    result = db["nadadores"].delete_one({"id_seudonimo": nadador_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Nadador no encontrado")

    return {"message": "Nadador eliminado", "deleted_count": result.deleted_count}


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

    db = DatabaseClient.get_db()
    result = db["registros_diarios"].delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

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