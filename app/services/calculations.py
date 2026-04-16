"""Business logic and calculations for the SIGRENE platform.

This module contains functions to compute derived training metrics
including Session RPE, training density, swimming efficiency,
TRIMP, ACWR, and performance analytics for elite swimmers.
"""

from datetime import date, timedelta
from typing import Dict, List, Optional, Union
from app.models.schemas import SesionEntrenamiento


def calculate_trimp(rpe: int, duration_minutes: int, fc_media: Optional[int] = None) -> Dict[str, float]:
    """Calculate Training Impulse (TRIMP) using RPE or heart rate.

    RPE-based TRIMP: sRPE = RPE × duration (minutes)
    HR-based TRIMP uses Edwards method with HR zones.

    Args:
        rpe: RPE (1-10).
        duration_minutes: Session duration in minutes.
        fc_media: Mean heart rate (bpm), optional. If provided, uses HR-based TRIMP.

    Returns:
        Dictionary with trimp value and method used.
    """
    if fc_media and fc_media > 0:
        hr_max = 220
        try:
            hr_pct = fc_media / hr_max * 100
        except (ValueError, ZeroDivisionError):
            return {"trimp": float(rpe * duration_minutes), "method": "rpe"}

        if hr_pct < 50:
            zone = 1
        elif hr_pct < 60:
            zone = 2
        elif hr_pct < 70:
            zone = 3
        elif hr_pct < 80:
            zone = 4
        else:
            zone = 5

        trimp = rpe * duration_minutes * zone
        return {"trimp": round(trimp, 1), "method": "hr"}
    else:
        trimp = rpe * duration_minutes
        return {"trimp": round(trimp, 1), "method": "rpe"}


def categorize_session_type(
    minutos_agua: Optional[int],
    minutos_fuerza: Optional[int],
    minutos_seco: Optional[int]
) -> str:
    """Categorize session type based on time distribution.

    Args:
        minutos_agua: Minutes of water training.
        minutos_fuerza: Minutes of strength training.
        minutos_seco: Minutes of dry land training (non-strength).

    Returns:
        Session type: tecnica, fuerza, resistencia, velocidad, mixto, recuperacion.
    """
    total = (minutos_agua or 0) + (minutos_fuerza or 0) + (minutos_seco or 0)
    if total == 0:
        return "indefinido"

    porc_agua = (minutos_agua or 0) / total
    porc_fuerza = (minutos_fuerza or 0) / total

    if porc_fuerza >= 0.6:
        return "fuerza"
    elif porc_agua >= 0.8:
        return "resistencia"
    elif porc_agua >= 0.5:
        return "mixto"
    else:
        return "tecnica"


def calculate_session_time_breakdown(session: SesionEntrenamiento) -> Dict[str, Union[int, float]]:
    """Calculate time breakdown and percentages for a session.

    Args:
        session: Session data with time distributions.

    Returns:
        Dictionary with minutos_agua, minutos_fuerza, minutos_seco, minutos_totales,
        porc_agua, porc_fuerza, porc_seco.
    """
    minutos_agua = session.minutos_entrenamiento_agua or 0
    minutos_fuerza = session.duracion_fuerza_minutos or 0
    minutos_seco = session.tiempo_seco_minutos or 0

    tiempo_explicit = minutos_agua + minutos_fuerza + minutos_seco
    if tiempo_explicit > 0:
        minutos_totales = session.tiempo_sesion_minutos
    else:
        minutos_totales = session.tiempo_sesion_minutos
        minutos_agua = minutos_totales

    total = minutos_totales if minutos_totales > 0 else 1

    return {
        "minutos_agua": minutos_agua,
        "minutos_fuerza": minutos_fuerza,
        "minutos_seco": minutos_seco,
        "minutos_totales": minutos_totales,
        "porc_agua": round(minutos_agua / total * 100, 1),
        "porc_fuerza": round(minutos_fuerza / total * 100, 1),
        "porc_seco": round(minutos_seco / total * 100, 1),
    }


def calculate_session_metrics(session: SesionEntrenamiento) -> Dict[str, Union[float, int]]:
    """Calculates derived metrics from a training session.

    Computes session density (meters per minute), sRPE (internal load),
    TRIMP, and time breakdown.

    Args:
        session: Session data containing time in minutes and RPE.

    Returns:
        Dictionary with calculated metrics: srpe, trimp, time breakdown.
    """
    metrics = {}

    metrics["srpe"] = round(session.rpe * session.tiempo_sesion_minutos, 1)

    trimp_result = calculate_trimp(session.rpe, session.tiempo_sesion_minutos, session.fc_media)
    metrics["trimp"] = trimp_result["trimp"]

    if session.lugar == "agua" and session.volumen_metros and session.tiempo_sesion_minutos > 0:
        metrics["densidad"] = round(session.volumen_metros / session.tiempo_sesion_minutos, 2)
    else:
        metrics["densidad"] = 0.0

    minutos_agua = session.minutos_entrenamiento_agua or 0
    minutos_fuerza = session.duracion_fuerza_minutos or 0
    minutos_seco = 0
    if session.lugar == "seco":
        minutos_seco = session.tiempo_sesion_minutos

    minutos_totales = session.tiempo_sesion_minutos

    metrics["minutos_agua"] = minutos_agua
    metrics["minutos_fuerza"] = minutos_fuerza
    metrics["minutos_seco"] = minutos_seco
    metrics["minutos_totales"] = minutos_totales

    total = minutos_totales if minutos_totales > 0 else 1
    metrics["porc_agua"] = round(minutos_agua / total * 100, 1)
    metrics["porc_fuerza"] = round(minutos_fuerza / total * 100, 1)
    metrics["porc_seco"] = round(minutos_seco / total * 100, 1)

    if session.lugar == "agua":
        metrics["tipo_sesion"] = session.tipo_entrenamiento or "resistencia"
    else:
        metrics["tipo_sesion"] = "seco"

    if session.estilos and session.lugar == "agua":
        total_estilos = sum([
            session.estilos.libre,
            session.estilos.espalda,
            session.estilos.braza,
            session.estilos.mariposa,
            session.estilos.combinado,
            session.estilos.otros
        ])
        if total_estilos > 0 and minutos_agua > 0:
            metrics["densidad_agua"] = round(total_estilos / minutos_agua, 2)

    return metrics


def calculate_wap(base_time: float, swimmer_time: float) -> float:
    """Calculate World Aquatic Points (WAP).

    Args:
        base_time: World record time in seconds.
        swimmer_time: Swimmer's time in seconds.

    Returns:
        WAP score (1000 = world record pace).
    """
    return round(1000 * (base_time / swimmer_time) ** 3, 1)


def calculate_swolf(time_seconds: float, stroke_count: int) -> float:
    """Calculate SWOLF (Swimming Golf) score.

    Args:
        time_seconds: Swim time in seconds.
        stroke_count: Total strokes taken.

    Returns:
        SWOLF score (lower = better efficiency).
    """
    return round(time_seconds + stroke_count, 1)


def calculate_stroke_rate(stroke_count: int, time_seconds: float) -> float:
    """Calculate stroke rate in strokes per minute.

    Args:
        stroke_count: Total strokes taken.
        time_seconds: Time in seconds.

    Returns:
        Strokes per minute.
    """
    return round(stroke_count / (time_seconds / 60), 1) if time_seconds > 0 else 0.0


def calculate_dps(distance_meters: int, stroke_count: int) -> float:
    """Calculate distance per stroke in meters.

    Args:
        distance_meters: Total distance swum.
        stroke_count: Total strokes taken.

    Returns:
        Meters per stroke.
    """
    return round(distance_meters / stroke_count, 2) if stroke_count > 0 else 0.0


def calculate_speed(distance_meters: int, time_seconds: float) -> float:
    """Calculate swimming speed in m/s.

    Args:
        distance_meters: Distance swum.
        time_seconds: Time taken.

    Returns:
        Speed in m/s.
    """
    return round(distance_meters / time_seconds, 2) if time_seconds > 0 else 0.0


def calculate_pace(time_seconds: float, distance_meters: int) -> float:
    """Calculate pace in seconds per 100m.

    Args:
        time_seconds: Time taken.
        distance_meters: Distance swum.

    Returns:
        Pace in seconds per 100m.
    """
    return round(time_seconds / (distance_meters / 100), 1) if distance_meters > 0 else 0.0


def calculate_css(time_200: float, time_400: float) -> Dict[str, float]:
    """Calculate Critical Swimming Speed.

    Args:
        time_200: Time for 200m in seconds.
        time_400: Time for 400m in seconds.

    Returns:
        Dictionary with css_speed_mps and css_pace_100.
    """
    if time_400 == time_200:
        return {"css_speed_mps": 0.0, "css_pace_100": 0.0}

    css_speed = (400 - 200) / (time_400 - time_200)
    css_pace = 100 / css_speed

    return {
        "css_speed_mps": round(css_speed, 2),
        "css_pace_100": round(css_pace, 1)
    }


def calculate_acwr(loads: List[float], week: int, time_window: int = 4) -> Dict[str, Union[float, str]]:
    """Calculate Acute-to-Chronic Workload Ratio using EWMA.

    Args:
        loads: List of training loads (sRPE values).
        week: Current week index (0-based).
        time_window: EWMA window (default 4 weeks).

    Returns:
        Dictionary with acwr, status, acute_load, chronic_load.
    """
    if week < time_window:
        return {"acwr": 0.0, "status": "Insufficient data"}

    decay = 2 / (time_window + 1)

    chronic_loads = []
    for i in range(week):
        if i == 0:
            chronic_loads.append(loads[0])
        else:
            chronic_loads.append(chronic_loads[-1] * (1 - decay) + loads[i] * decay)

    acute_load = loads[week]
    chronic_load = chronic_loads[-1]

    acwr = acute_load / chronic_load if chronic_load > 0 else 0.0

    if acwr < 0.8:
        status = "Low"
    elif acwr <= 1.3:
        status = "Optimal"
    elif acwr <= 1.5:
        status = "High Risk"
    else:
        status = "Very High Risk"

    return {
        "acwr": round(acwr, 2),
        "status": status,
        "acute_load": acute_load,
        "chronic_load": round(chronic_load, 1)
    }


def calculate_weekly_load(volume_meters: int, duration_minutes: float, rpe: float) -> Dict[str, float]:
    """Calculate weekly training load metrics.

    Args:
        volume_meters: Weekly volume in meters.
        duration_minutes: Total weekly training time in minutes.
        rpe: Average RPE for the week.

    Returns:
        Dictionary with srpe, density, and volume_per_day.
    """
    return {
        "srpe": round(rpe * duration_minutes, 1),
        "densidad": round(volume_meters / duration_minutes, 1) if duration_minutes > 0 else 0.0,
        "volumen_semanal": volume_meters,
        "duracion_semanal": duration_minutes
    }