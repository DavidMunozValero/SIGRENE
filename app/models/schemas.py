"""Pydantic schemas for the SIGRENE platform.

This module contains the data validation models for the daily records,
morning wellness, and external training loads of elite swimmers.
"""

from datetime import date, datetime
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


class EstilosNado(BaseModel):
    """Volume breakdown by swimming stroke/style.

    Attributes:
        libre (int): Freestyle distance in meters.
        espalda (int): Backstroke distance in meters.
        braza (int): Breaststroke distance in meters.
        mariposa (int): Butterfly distance in meters.
        combinado (int): Individual medley distance in meters.
        otros (int): Other styles distance in meters.
    """
    libre: int = Field(default=0, ge=0, description="Crol/Libre (metros)")
    espalda: int = Field(default=0, ge=0, description="Espalda (metros)")
    braza: int = Field(default=0, ge=0, description="Braza (metros)")
    mariposa: int = Field(default=0, ge=0, description="Mariposa (metros)")
    combinado: int = Field(default=0, ge=0, description="Combinado (metros)")
    otros: int = Field(default=0, ge=0, description="Otros estilos (metros)")


class SesionEntrenamiento(BaseModel):
    """Training session data and external load metrics.

    Attributes:
        volumen_metros (int): Total swimming volume in meters.
        tiempo_sesion_minutos (int): Total duration of the session in minutes.
        rpe (int): Rating of Perceived Exertion on a scale from 1 to 10.
        video_tecnica_uri (Optional[str]): SeaweedFS URI for technique analysis video.
        estilos (Optional[EstilosNado]): Volume breakdown by swimming stroke.
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
    estilos: Optional[EstilosNado] = Field(
        default=None, description="Desglose por estilos de nado"
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


class RegistroDiarioResponse(BaseModel):
    """Schema for returning a daily record from the database.

    Attributes:
        id (str): MongoDB document ID.
        nadador_id (str): Pseudonymized identifier for the swimmer.
        fecha (date): Date of the record.
        entrenador_id (str): Identifier of the coach who registered the data.
        registro_manana (Optional[RegistroManana]): Morning wellness data.
        sesion_entrenamiento (Optional[SesionEntrenamiento]): Training session data.
        created_at (Optional[datetime]): Timestamp when the record was created.
    """
    id: str = Field(..., description="ID del documento en MongoDB")
    nadador_id: str = Field(..., description="ID seudonimizado del atleta")
    fecha: date = Field(..., description="Fecha del registro")
    entrenador_id: str = Field(..., description="ID del entrenador que registra")
    registro_manana: Optional[RegistroManana] = None
    sesion_entrenamiento: Optional[SesionEntrenamiento] = None
    created_at: Optional[datetime] = Field(default=None, description="Fecha de creación del registro")

    class Config:
        populate_by_name = True


class RegistroDiarioListResponse(BaseModel):
    """Schema for paginated list of daily records.

    Attributes:
        total (int): Total number of records matching the query.
        skip (int): Number of records skipped.
        limit (int): Maximum number of records to return.
        registros (List[RegistroDiarioResponse]): List of daily records.
    """
    total: int = Field(..., description="Total de registros encontrados")
    skip: int = Field(..., description="Registros omitidos")
    limit: int = Field(..., description="Límite de registros devueltos")
    registros: List[RegistroDiarioResponse] = Field(default_factory=list, description="Lista de registros diarios")


class DashboardStats(BaseModel):
    """Aggregated statistics for the dashboard.

    Attributes:
        total_sesiones (int): Total number of training sessions.
        volumen_total (int): Total swimming volume in meters.
        duracion_total (int): Total training duration in minutes.
        volumen_semanal (int): Weekly swimming volume.
        sesiones_semanales (int): Number of sessions this week.
        rpe_promedio (float): Average RPE across all sessions.
        densidad_promedio (float): Average density across sessions.
        srpe_promedio (float): Average sRPE across sessions.
        estilos_totales (EstilosNado): Aggregated volume by style.
        volumen_por_dia (List[dict]): Daily volume data for chart.
        actividad_mensual (List[dict]): Monthly activity calendar data.
    """
    total_sesiones: int = Field(0, description="Total de sesiones")
    volumen_total: int = Field(0, description="Volumen total (metros)")
    duracion_total: int = Field(0, description="Duración total (minutos)")
    volumen_semanal: int = Field(0, description="Volumen semanal")
    sesiones_semanales: int = Field(0, description="Sesiones semanales")
    rpe_promedio: float = Field(0.0, description="RPE promedio")
    densidad_promedio: float = Field(0.0, description="Densidad promedio")
    srpe_promedio: float = Field(0.0, description="sRPE promedio")
    estilos_totales: EstilosNado = Field(default_factory=EstilosNado, description="Volumen por estilo")
    volumen_por_dia: List[dict] = Field(default_factory=list, description="Volumen por día")
    actividad_mensual: List[dict] = Field(default_factory=list, description="Actividad mensual")