"""Pydantic schemas for the SIGRENE platform.

This module contains the data validation models for the daily records,
morning wellness, and external training loads of elite swimmers.
"""

from datetime import date
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional


class RegistroManana(BaseModel):
    """Morning wellness and physiological record of the swimmer.

    Attributes:
        saturacion_o2_porcentaje (int): Blood oxygen saturation level (0-100%).
        fc_reposo_ppm (int): Resting heart rate in beats per minute.
        peso_ayunas_kg (float): Fasting body weight in kilograms.
        horas_sueno (float): Total hours of sleep reported by the swimmer.
    """
    saturacion_o2_porcentaje: int = Field(
        ..., ge=0, le=100, description="Saturación de oxígeno (0-100%)"
    )
    fc_reposo_ppm: int = Field(
        ..., gt=0, le=250, description="Frecuencia cardíaca en reposo"
    )
    peso_ayunas_kg: float = Field(
        ..., gt=30.0, description="Peso corporal en kilogramos"
    )
    horas_sueno: float = Field(
        ..., ge=0.0, le=24.0, description="Horas de sueño reportadas"
    )


class SesionEntrenamiento(BaseModel):
    """Training session data and external load metrics.

    Attributes:
        volumen_metros (int): Total swimming volume in meters.
        tiempo_sesion_minutos (int): Total duration of the session in minutes.
        rpe (int): Rating of Perceived Exertion on a scale from 1 to 10.
        video_tecnica_uri (Optional[str]): SeaweedFS URI for technique analysis video.
    """
    volumen_metros: int = Field(
        ..., ge=0, description="Metros totales de la sesión"
    )
    tiempo_sesion_minutos: int = Field(
        ..., gt=0, description="Duración en minutos"
    )
    rpe: int = Field(
        ..., ge=1, le=10, description="Percepción subjetiva del esfuerzo (1-10)"
    )
    video_tecnica_uri: Optional[str] = Field(
        default=None, description="URI del vídeo en SeaweedFS"
    )


class RegistroDiario(BaseModel):
    """Daily registry combining morning wellness and training session data.

    Attributes:
        nadador_id (str): Pseudonymized identifier for the swimmer.
        fecha (date): Date of the record.
        entrenador_id (str): Identifier of the coach registering the data.
        registro_manana (Optional[RegistroManana]): Morning wellness data.
        sesion_entrenamiento (Optional[SesionEntrenamiento]): Training session data.
    """
    nadador_id: str = Field(..., description="ID seudonimizado del atleta")
    fecha: date = Field(..., description="Fecha del registro")
    entrenador_id: str = Field(..., description="ID del entrenador que registra")
    registro_manana: Optional[RegistroManana] = None
    sesion_entrenamiento: Optional[SesionEntrenamiento] = None


class UsuarioBase(BaseModel):
    """Base schema for platform users containing shared attributes.

    Attributes:
        email (EmailStr): The user's valid email address.
        nombre_completo (str): The full name of the user.
        rol (str): The assigned role (e.g., 'entrenador', 'medico', 'admin').
        nadadores_asignados (List[str]): List of swimmer IDs this user can access.
    """
    email: EmailStr = Field(..., description="Correo electrónico del usuario")
    nombre_completo: str = Field(..., description="Nombre completo del profesional")
    rol: str = Field(..., description="Rol de acceso a la plataforma")
    nadadores_asignados: List[str] = Field(
        default_factory=list,
        description="Lista de IDs de nadadores bajo su tutela"
    )


class UsuarioCreate(UsuarioBase):
    """Schema used when creating a new user (registration).

    Attributes:
        password (str): The raw, unhashed password provided by the user.
    """
    password: str = Field(
        ...,
        min_length=8,
        description="Contraseña en texto plano (mínimo 8 caracteres)"
    )


class UsuarioInDB(UsuarioBase):
    """Schema representing the user as stored in the MongoDB database.

    Attributes:
        hashed_password (str): The securely hashed password.
        activo (bool): Indicates if the account is currently active or suspended.
    """
    hashed_password: str = Field(..., description="Contraseña encriptada (Bcrypt)")
    activo: bool = Field(default=True, description="Estado de la cuenta")


class Token(BaseModel):
    """Schema for the JWT authentication token payload.

    Attributes:
        access_token (str): The encoded JSON Web Token.
        token_type (str): The type of token, typically 'bearer'.
    """
    access_token: str = Field(..., description="Token JWT generado")
    token_type: str = Field(..., description="Tipo de token (ej. bearer)")