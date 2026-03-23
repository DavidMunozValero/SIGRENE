"""Business logic and calculations for the SIGRENE platform.

This module contains the functions to compute derived training metrics
such as Session RPE (sRPE) and training density based on raw inputs
provided by the coaching staff.
"""

from typing import Dict, Union
from app.models.schemas import SesionEntrenamiento


def calculate_session_metrics(session: SesionEntrenamiento) -> Dict[str, Union[float, int]]:
    """Calculates derived metrics from a swimming training session.

    Computes the session density (meters per minute) and the session
    Rating of Perceived Exertion (sRPE) representing the internal load.

    Args:
        session (SesionEntrenamiento): The validated session data containing
            volume in meters, time in minutes, and RPE.

    Returns:
        Dict[str, Union[float, int]]: A dictionary containing the calculated
            'densidad' (float) and 'srpe' (int). Returns a density of 0.0
            if session time is 0 to prevent ZeroDivisionError.
    """

    # Calculate Density (m/min)
    if session.tiempo_sesion_minutos > 0:
        densidad = session.volumen_metros / session.tiempo_sesion_minutos
    else:
        densidad = 0.0

    # Calculate sRPE (Session RPE)
    srpe = session.rpe * session.tiempo_sesion_minutos

    # TRIMP could be added here in the future if HR data is included
    # in the session schema instead of just the morning registry.

    return {
        "densidad": round(densidad, 2),
        "srpe": srpe
    }