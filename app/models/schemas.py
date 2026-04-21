from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any
from enum import Enum


class GeneroEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"


class EstiloEnum(str, Enum):
    FREESTYLE = "freestyle"
    BACKSTROKE = "backstroke"
    BREASTSTROKE = "breaststroke"
    BUTTERFLY = "butterfly"
    IM = "IM"
    FREE_RELAY = "free_relay"
    MEDLEY_RELAY = "medley_relay"


class EmergencyContact(BaseModel):
    nombre: str = Field(..., description='Nombre del contacto de emergencia')
    telefono: str = Field(..., description='Teléfono de emergencia')
    relacion: str = Field(..., description='Relación (madre, padre, tutor, etc.)')


class TrainingGroupBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description='Nombre del grupo')
    description: Optional[str] = Field(default=None, description='Descripción del grupo')


class TrainingGroupCreate(TrainingGroupBase):
    pass


class TrainingGroupUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class TrainingGroupResponse(TrainingGroupBase):
    id: str = Field(..., description='ID del grupo')
    coach_id: str = Field(..., description='ID del entrenador propietario')
    is_active: bool = Field(default=True)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class RegistroManana(BaseModel):
    saturacion_o2_porcentaje: Optional[int] = Field(default=None, ge=0, le=100, description='Saturación O2 (%)')
    fc_reposo_ppm: Optional[int] = Field(default=None, gt=0, le=250, description='FC reposo (ppm)')
    peso_ayunas_kg: Optional[float] = Field(default=None, gt=30.0, description='Peso en ayunas (kg)')
    horas_sueno: Optional[float] = Field(default=None, ge=0.0, le=24.0, description='Horas de sueño')
    calidad_sueno: Optional[int] = Field(default=None, ge=1, le=7, description='Calidad sueño (1-7)')
    despertares_nocturnos: Optional[int] = Field(default=None, ge=0, description='Despertares nocturnos')
    siesta: Optional[bool] = Field(default=None, description='¿Siesta?')
    dolor_cabeza: Optional[int] = Field(default=None, ge=0, le=3, description='Dolor cabeza (0-3)')
    fatiga_general: Optional[int] = Field(default=None, ge=0, le=3, description='Fatiga general (0-3)')
    nauseas: Optional[int] = Field(default=None, ge=0, le=3, description='Náuseas (0-3)')
    mareos: Optional[int] = Field(default=None, ge=0, le=3, description='Mareos (0-3)')
    fatiga_piernas: Optional[int] = Field(default=None, ge=1, le=7, description='Fatiga piernas (1-7)')
    fatiga_brazos: Optional[int] = Field(default=None, ge=1, le=7, description='Fatiga brazos (1-7)')
    sintomas_gripe: Optional[int] = Field(default=None, ge=1, le=7, description='Síntomas gripe (1-7)')
    apetito: Optional[int] = Field(default=None, ge=1, le=7, description='Apetito (1-7)')
    estado_hidratacion: Optional[int] = Field(default=None, ge=1, le=7, description='Hidratación (1-7)')
    estado_recuperacion: Optional[int] = Field(default=None, ge=1, le=10, description='Recuperación (1-10)')
    annotaciones: Optional[str] = Field(default=None, description='Anotaciones matutinas')


class EstilosNado(BaseModel):
    libre: int = Field(default=0, ge=0, description='Crol/Libre (metros)')
    espalda: int = Field(default=0, ge=0, description='Espalda (metros)')
    braza: int = Field(default=0, ge=0, description='Braza (metros)')
    mariposa: int = Field(default=0, ge=0, description='Mariposa (metros)')
    combinado: int = Field(default=0, ge=0, description='Combinado (metros)')
    otros: int = Field(default=0, ge=0, description='Otros estilos (metros)')


class SesionEntrenamiento(BaseModel):
    lugar: Optional[str] = Field(default='agua', description='Lugar: agua/seco')
    hora: Optional[str] = Field(default=None, description='Hora (HH:MM)')
    tiempo_sesion_minutos: int = Field(..., gt=0, description='Duración sesión (min)')
    rpe: int = Field(..., ge=1, le=10, description='RPE (1-10)')
    fc_media: Optional[int] = Field(default=None, ge=60, le=220, description='FC media (ppm)')
    video_tecnica_uri: Optional[str] = Field(default=None, description='URI vídeo técnica')
    
    zona_intensidad: Optional[int] = Field(default=None, ge=1, le=5, description='Zona intensidad (1-5)')
    tipo_entrenamiento: Optional[str] = Field(
        default=None,
        description='Tipo: tecnica/velocidad/resistencia/fuerza/recuperacion'
    )
    
    # Campos agua
    volumen_metros: Optional[int] = Field(default=None, ge=0, description='Metros totales nado')
    estilos: Optional[EstilosNado] = Field(default=None, description='Volumen por estilo')
    minutos_entrenamiento_agua: Optional[int] = Field(default=None, ge=0, description='Minutos nado')
    
    # Campos seco
    ejercicio_principal: Optional[str] = Field(default=None, description='Ejercicio principal')
    series: Optional[int] = Field(default=None, ge=0, description='Series')
    repeticiones: Optional[int] = Field(default=None, ge=0, description='Repeticiones')
    peso_kg: Optional[float] = Field(default=None, gt=0, description='Peso (kg)')
    
    # Fuerza
    sesion_fuerza: Optional[bool] = Field(default=None, description='¿Sesión fuerza/potencia?')
    duracion_fuerza_minutos: Optional[int] = Field(default=None, ge=0, description='Duración fuerza (min)')
    
    # General
    esfuerzo_percibido: Optional[int] = Field(default=None, ge=1, le=5, description='Estrés percibido (1-5)')
    annotaciones: Optional[str] = Field(default=None, description='Anotaciones de sesión')


class SesionCalculada(BaseModel):
    srpe: float = Field(..., description='sRPE: RPE × duración')
    densidad: float = Field(..., description='Metros por minuto')
    trimp: Optional[float] = Field(default=None, description='Training Impulse (TRIMP)')
    tipo_sesion: Optional[str] = Field(default=None, description='Tipo clasificado según distribución')
    
    minutos_agua: Optional[int] = Field(default=None, description='Minutos en agua')
    minutos_fuerza: Optional[int] = Field(default=None, description='Minutos en fuerza')
    minutos_seco: Optional[int] = Field(default=None, description='Minutos en trabajo seco')
    minutos_totales: Optional[int] = Field(default=None, description='Minutos totales entreno')
    
    porc_agua: Optional[float] = Field(default=None, description='Porcentaje agua')
    porc_fuerza: Optional[float] = Field(default=None, description='Porcentaje fuerza')
    porc_seco: Optional[float] = Field(default=None, description='Porcentaje seco')


class RegistroDiario(BaseModel):
    nadador_id: str = Field(..., description='ID seudonimizado del atleta')
    fecha: date = Field(..., description='Fecha del registro')
    entrenador_id: str = Field(..., description='ID del entrenador que registra')
    registro_manana: Optional[RegistroManana] = None
    sesion_entrenamiento: Optional[SesionEntrenamiento] = None


class NadadorBase(BaseModel):
    pseudonym: Optional[str] = Field(default=None, description='ID seudonimizado único (ej: NAD-2026-0042). Auto-generado si no se proporciona.')
    nombre: str = Field(..., description='Nombre del nadador')
    apellidos: Optional[str] = Field(default=None, description='Apellidos del nadador')
    fecha_nacimiento: Optional[date] = Field(default=None, description='Fecha de nacimiento')
    genero: Optional[GeneroEnum] = Field(default=None, description='Género')
    
    provincia: Optional[str] = Field(default=None, description='Provincia')
    club: Optional[str] = Field(default=None, description='Club')
    
    # Estilos preferidos
    estilos: Optional[List[EstiloEnum]] = Field(
        default_factory=list,
        description='Estilos que compete el nadador'
    )
    
    # Datos morfológicos
    altura_cm: Optional[float] = Field(default=None, gt=0, description='Altura (cm)')
    altura_sentado_cm: Optional[float] = Field(default=None, gt=0, description='Altura sentado (cm)')
    envergadura_cm: Optional[float] = Field(default=None, gt=0, description='Envergadura (cm)')
    talla_pie_cm: Optional[float] = Field(default=None, gt=0, description='Talla de pie (cm)')
    tamanio_mano_cm: Optional[float] = Field(default=None, gt=0, description='Tamaño de mano (cm)')
    
    # Contacto de emergencia
    contacto_emergencia: Optional[EmergencyContact] = Field(default=None, description='Datos de contacto de emergencia')
    
    # Reporting a padres
    email_padres: Optional[EmailStr] = Field(default=None, description='Email de los padres/tutores')
    reportes_activos: bool = Field(default=False, description='Si los reportes están activos')


class NadadorCreate(NadadorBase):
    group_id: Optional[str] = Field(default=None, description='ID del grupo de entrenamiento')


class NadadorUpdate(BaseModel):
    nombre: Optional[str] = None
    apellidos: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    genero: Optional[GeneroEnum] = None
    provincia: Optional[str] = None
    club: Optional[str] = None
    estilos: Optional[List[EstiloEnum]] = None
    altura_cm: Optional[float] = None
    altura_sentado_cm: Optional[float] = None
    envergadura_cm: Optional[float] = None
    talla_pie_cm: Optional[float] = None
    tamanio_mano_cm: Optional[float] = None
    contacto_emergencia: Optional[EmergencyContact] = None
    email_padres: Optional[EmailStr] = None
    reportes_activos: Optional[bool] = None
    group_id: Optional[str] = None
    is_archived: Optional[bool] = None


class NadadorResponse(NadadorBase):
    id_seudonimo: str = Field(..., description='ID seudonimizado (para compatibilidad)')
    coach_id: Optional[str] = Field(default=None, description='ID del entrenador asignado')
    group_id: Optional[str] = Field(default=None, description='ID del grupo de entrenamiento')
    group_name: Optional[str] = Field(default=None, description='Nombre del grupo (joined)')
    is_archived: bool = Field(default=False, description='Si está archivado')
    archived_at: Optional[datetime] = Field(default=None, description='Fecha de archivado')
    created_by: Optional[str] = Field(default=None, description='ID del creador')
    created_at: Optional[datetime] = Field(default=None, description='Fecha de creación')
    updated_by: Optional[str] = Field(default=None, description='ID del último editor')
    updated_at: Optional[datetime] = Field(default=None, description='Última modificación')


class UsuarioBase(BaseModel):
    email: EmailStr = Field(..., description='Correo electrónico del usuario')
    nombre_completo: str = Field(..., description='Nombre completo del profesional')
    rol: str = Field(..., description='Rol de acceso a la plataforma')
    nadadores_asignados: List[str] = Field(
        default_factory=list,
        description='Lista de IDs de nadadores bajo su tutela'
    )


class UsuarioCreate(UsuarioBase):
    password: str = Field(
        ...,
        min_length=8,
        description='Contraseña en texto plano (mínimo 8 caracteres)'
    )


class UsuarioInDB(UsuarioBase):
    hashed_password: str = Field(..., description='Contraseña encriptada (Bcrypt)')
    activo: bool = Field(default=True, description='Estado de la cuenta')


class Token(BaseModel):
    access_token: str = Field(..., description='Token JWT generado')
    token_type: str = Field(..., description='Tipo de token (ej. bearer)')


class RegistroDiarioResponse(BaseModel):
    id: str = Field(..., description='ID del documento en MongoDB')
    nadador_id: str = Field(..., description='ID seudonimizado del atleta')
    fecha: date = Field(..., description='Fecha del registro')
    entrenador_id: str = Field(..., description='ID del entrenador que registra')
    registro_manana: Optional[RegistroManana] = None
    sesion_entrenamiento: Optional[SesionEntrenamiento] = None
    created_at: Optional[datetime] = Field(default=None, description='Fecha de creación del registro')
    updated_at: Optional[datetime] = Field(default=None, description='Última modificación')
    calculos: Optional[SesionCalculada] = Field(default=None, description='Métricas calculadas')

    class Config:
        populate_by_name = True


class RegistroDiarioListResponse(BaseModel):
    total: int = Field(..., description='Total de registros encontrados')
    skip: int = Field(..., description='Registros omitidos')
    limit: int = Field(..., description='Límite de registros devueltos')
    registros: List[RegistroDiarioResponse] = Field(default_factory=list, description='Lista de registros diarios')


class DashboardStats(BaseModel):
    total_sesiones: int = Field(0, description='Total de sesiones')
    volumen_total: int = Field(0, description='Volumen total (metros)')
    duracion_total: int = Field(0, description='Duración total (minutos)')
    volumen_semanal: int = Field(0, description='Volumen semanal')
    sesiones_semanales: int = Field(0, description='Sesiones semanales')
    rpe_promedio: float = Field(0.0, description='RPE promedio')
    densidad_promedio: float = Field(0.0, description='Densidad promedio')
    srpe_promedio: float = Field(0.0, description='sRPE promedio')
    estilos_totales: EstilosNado = Field(default_factory=EstilosNado, description='Volumen por estilo')
    volumen_por_dia: List[dict] = Field(default_factory=list, description='Volumen por día')
    actividad_mensual: List[dict] = Field(default_factory=list, description='Actividad mensual')


class ControlFisiológico(BaseModel):
    nadador_id: str = Field(..., description='ID del nadador')
    fecha: date = Field(..., description='Fecha del control')
    entrenador_id: str = Field(..., description='ID del entrenador')
    
    hrv_rmssd: Optional[float] = Field(default=None, description='HRV RMSSD (ms)')
    hrv_sdnn: Optional[float] = Field(default=None, description='HRV SDNN (ms)')
    hrv_fc_reposo: Optional[int] = Field(default=None, description='FC reposo (ppm)')
    
    cmj_altura_cm: Optional[float] = Field(default=None, ge=0, description='CMJ altura (cm)')
    cmj_tiempo_contacto_ms: Optional[float] = Field(default=None, description='CMJ tiempo contacto (ms)')
    cmj_potencia_wkg: Optional[float] = Field(default=None, description='CMJ potencia (W/kg)')
    
    dominadas_num: Optional[int] = Field(default=None, ge=0, description='Dominadas (número)')
    dominadas_kg_extra: Optional[float] = Field(default=None, ge=0, description='KG extra dominadas')
    
    lactato_4mmol_velocidad: Optional[float] = Field(default=None, description='V4 velocidad (m/s)')
    lactato_concentracion_mmol: Optional[float] = Field(default=None, description='Lactato (mmol/L)')
    lactato_zona_test: Optional[str] = Field(default=None, description='Zona test lactate')
    
    cortisol_ugdl: Optional[float] = Field(default=None, description='Cortisol (µg/dL)')
    testosterona_ngdl: Optional[float] = Field(default=None, description='Testosterona (ng/dL)')
    
    annotaciones: Optional[str] = Field(default=None, description='Anotaciones')


class ControlFisiológicoResponse(ControlFisiológico):
    id: str = Field(..., description='ID del documento')
    created_at: Optional[datetime] = Field(default=None, description='Fecha creación')
    updated_at: Optional[datetime] = Field(default=None, description='Última modificación')
    ratio_cortisol_testo: Optional[float] = Field(default=None, description='Ratio C/T (calculado)')


class ComposicionCorporal(BaseModel):
    nadador_id: str = Field(..., description='ID del nadador')
    fecha: date = Field(..., description='Fecha de la medición')
    entrenador_id: str = Field(..., description='ID del entrenador')
    
    altura_cm: Optional[float] = Field(default=None, gt=0, description='Altura (cm)')
    peso_kg: Optional[float] = Field(default=None, gt=0, description='Peso (kg)')
    altura_sentado_cm: Optional[float] = Field(default=None, gt=0, description='Altura sentado (cm)')
    envergadura_cm: Optional[float] = Field(default=None, gt=0, description='Envergadura (cm)')
    longitud_pie_cm: Optional[float] = Field(default=None, gt=0, description='Longitud pie (cm)')
    longitud_mano_cm: Optional[float] = Field(default=None, gt=0, description='Longitud mano (cm)')
    distancia_biacromial_cm: Optional[float] = Field(default=None, gt=0, description='Distancia biacromial (cm)')
    
    masa_muscular_porc: Optional[float] = Field(default=None, ge=0, le=100, description='Masa muscular (%)')
    masa_grasa_porc: Optional[float] = Field(default=None, ge=0, le=100, description='Masa grasa (%)')
    masa_osea_kg: Optional[float] = Field(default=None, gt=0, description='Masa ósea (kg)')
    hidratacion_porc: Optional[float] = Field(default=None, ge=0, le=100, description='Hidratación (%)')
    
    annotaciones: Optional[str] = Field(default=None, description='Anotaciones')


class ComposicionCorporalResponse(ComposicionCorporal):
    id: str = Field(..., description='ID del documento')
    created_at: Optional[datetime] = Field(default=None, description='Fecha creación')
    updated_at: Optional[datetime] = Field(default=None, description='Última modificación')


class AnalisisCompeticion(BaseModel):
    nadador_id: str = Field(..., description='ID del nadador')
    fecha: date = Field(..., description='Fecha de la competición')
    entrenador_id: str = Field(..., description='ID del entrenador')
    nombre_competicion: str = Field(..., description='Nombre competición')
    prueba: str = Field(..., description='Prueba (ej: 100m libre)')
    estilo: str = Field(..., description='Estilo')
    
    tiempo_total_segundos: Optional[float] = Field(default=None, gt=0, description='Tiempo total (s)')
    ronda: Optional[str] = Field(default=None, description='Ronda: heats/semifinal/final')
    posicion: Optional[int] = Field(default=None, ge=1, description='Posición')
    
    parcial_1_25m: Optional[float] = Field(default=None, gt=0, description='Parcial 1 (25m)')
    parcial_2_50m: Optional[float] = Field(default=None, gt=0, description='Parcial 2 (50m)')
    parcial_3_75m: Optional[float] = Field(default=None, gt=0, description='Parcial 3 (75m)')
    parcial_4_100m: Optional[float] = Field(default=None, gt=0, description='Parcial 4 (100m)')
    parcial_5_125m: Optional[float] = Field(default=None, gt=0, description='Parcial 5 (125m)')
    parcial_6_150m: Optional[float] = Field(default=None, gt=0, description='Parcial 6 (150m)')
    parcial_7_175m: Optional[float] = Field(default=None, gt=0, description='Parcial 7 (175m)')
    parcial_8_200m: Optional[float] = Field(default=None, gt=0, description='Parcial 8 (200m)')
    
    parcial_salida_15m: Optional[float] = Field(default=None, gt=0, description='Salida 0-15m (s)')
    parcial_viraje_10m: Optional[float] = Field(default=None, gt=0, description='Viraje 5m pre-post pared (s)')
    parcial_subacuatico_dist_m: Optional[float] = Field(default=None, ge=0, description='Distancia subacuática (m)')
    parcial_subacuatico_velocidad: Optional[float] = Field(default=None, gt=0, description='Velocidad subacuática (m/s)')
    
    sl_metros_ciclo: Optional[float] = Field(default=None, gt=0, description='SL Longitud brazada (m/ciclo)')
    sr_ciclos_minuto: Optional[float] = Field(default=None, gt=0, description='SR Frecuencia brazada (c/min)')
    indice_brazada: Optional[float] = Field(default=None, description='Índice brazada')
    velocidad_nado_mps: Optional[float] = Field(default=None, gt=0, description='Velocidad nado (m/s)')
    
    drop_off_porc: Optional[float] = Field(default=None, description='Drop-off 1er-2do 50% (%)')
    
    annotaciones: Optional[str] = Field(default=None, description='Anotaciones')


class AnalisisCompeticionResponse(AnalisisCompeticion):
    id: str = Field(..., description='ID del documento')
    created_at: Optional[datetime] = Field(default=None, description='Fecha creación')
    updated_at: Optional[datetime] = Field(default=None, description='Última modificación')


class ACWRResponse(BaseModel):
    nadador_id: str = Field(..., description='ID del nadador')
    fecha_semana: date = Field(..., description='Semana de referencia')
    acwr: float = Field(..., description='Ratio ACWR')
    status: str = Field(..., description='Estado: Low/Optimal/High Risk/Very High Risk')
    carga_aguda: float = Field(..., description='Carga aguda (sRPE semana actual)')
    carga_cronica: float = Field(..., description='Carga crónica (promedio 4 semanas)')
    volumen_semanal: int = Field(..., description='Volumen semanal (m)')
    sesiones_semanales: int = Field(..., description='Sesiones semanales')


class ListaResponse(BaseModel):
    total: int = Field(..., description='Total de registros')
    skip: int = Field(..., description='Registros omitidos')
    limit: int = Field(..., description='Límite')
    datos: List[Any] = Field(default_factory=list, description='Lista de registros')


class UpdateResponse(BaseModel):
    message: str = Field(..., description='Mensaje de confirmación')
    modified_count: int = Field(..., description='Número de documentos modificados')


class DeleteResponse(BaseModel):
    message: str = Field(..., description='Mensaje de confirmación')
    deleted_count: int = Field(..., description='Número de documentos eliminados')