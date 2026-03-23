"""Main entry point for the SIGRENE FastAPI application.

This module initializes the web server, handles the database connection
lifecycle, and defines the API routes (endpoints) for the frontend to consume.
"""

from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm

from app.database.mongodb import DatabaseClient
from app.models.schemas import RegistroDiario, UsuarioCreate, UsuarioInDB, Token
from app.services.auth import verify_password, get_password_hash, create_access_token, get_current_user
from app.services.calculations import calculate_session_metrics
from app.services.auth import verify_password, get_password_hash, create_access_token


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


@app.post("/api/v1/registros-diarios/", status_code=201)
async def create_registro_diario(
        registro: RegistroDiario,
        current_user: dict = Depends(get_current_user)  # <--- ¡ESTE ES EL CANDADO!
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