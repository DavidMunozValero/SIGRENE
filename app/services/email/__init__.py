"""Email services for SIGRENE.

Usage:
    from app.services.email.factory import get_email_service
    from app.services.email.templates import contact_form_notification

    email = get_email_service()
    await email.send(contact_form_notification(
        name="Juan",
        email="juan@example.com",
        subject="Consulta",
        message="Hola, tengo una pregunta..."
    ))
"""

from app.services.email.base import BaseEmailProvider, EmailMessage
from app.services.email.factory import get_email_service, get_email_provider

__all__ = [
    "BaseEmailProvider",
    "EmailMessage",
    "get_email_service",
    "get_email_provider",
]
