"""Email templates for SIGRENE notifications."""

from typing import Optional
from app.services.email.base import EmailMessage


def contact_form_notification(
    name: str,
    email: str,
    subject: str,
    message: str,
    admin_email: str = "admin@sigrene.es",
) -> EmailMessage:
    """Template for contact form submissions."""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #004d98; color: white; padding: 20px; text-align: center;">
            <h1>Nuevo mensaje de contacto</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Nombre:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:{email}">{email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Asunto:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{subject}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Mensaje:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{message}</td>
                </tr>
            </table>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este mensaje fue enviado a través del formulario de contacto de SIGRENE.</p>
        </div>
    </body>
    </html>
    """
    return EmailMessage(
        to=[admin_email],
        subject=f"[SIGRENE] Contacto: {subject}",
        html_body=html,
        text_body=f"Nombre: {name}\nEmail: {email}\nAsunto: {subject}\nMensaje: {message}",
    )


def new_registration_notification(
    user_email: str,
    user_name: str,
    user_role: str,
    admin_email: str = "admin@sigrene.es",
) -> EmailMessage:
    """Template for new user registration notifications to admins."""
    role_display = {
        "coach": "Entrenador",
        "swimmer": "Nadador",
        "admin_federacion": "Administrador de Federación",
    }.get(user_role, user_role)

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #004d98; color: white; padding: 20px; text-align: center;">
            <h1>Nuevo registro pendiente de aprobación</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <p>Se ha registrado un nuevo usuario en SIGRENE:</p>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Nombre:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{user_name}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><a href="mailto:{user_email}">{user_email}</a></td>
                </tr>
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;"><strong>Rol:</strong></td>
                    <td style="padding: 10px; border-bottom: 1px solid #ddd;">{role_display}</td>
                </tr>
            </table>
            <p style="margin-top: 20px;">Este usuario está pendiente de aprobación antes de poder acceder a la plataforma.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Accede al panel de administración para aprobar o rechazar este registro.</p>
        </div>
    </body>
    </html>
    """
    return EmailMessage(
        to=[admin_email],
        subject=f"[SIGRENE] Nuevo registro pendiente: {user_name}",
        html_body=html,
        text_body=f"Nuevo registro:\nNombre: {user_name}\nEmail: {user_email}\nRol: {role_display}",
    )


def password_recovery_email(
    email: str,
    reset_url: str,
    expires_minutes: int = 30,
) -> EmailMessage:
    """Template for password recovery emails."""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #004d98; color: white; padding: 20px; text-align: center;">
            <h1>Recuperación de contraseña</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <p>Has solicitado restablecer tu contraseña en SIGRENE.</p>
            <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="background: #004d98; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Restablecer contraseña
                </a>
            </div>
            <p style="color: #666; font-size: 14px;">Este enlace expira en {expires_minutes} minutos.</p>
            <p style="color: #666; font-size: 14px;">Si no solicitaste este cambio, puedes ignorar este email.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </div>
    </body>
    </html>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Restablecer contraseña",
        html_body=html,
        text_body=f"Recupera tu contraseña en: {reset_url}\nEste enlace expira en {expires_minutes} minutos.",
    )


def account_approved_email(
    email: str,
    name: str,
    login_url: str = "https://sigrene.vercel.app/login",
) -> EmailMessage:
    """Template for account approval notification."""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #004d98; color: white; padding: 20px; text-align: center;">
            <h1>¡Cuenta aprobada!</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <p>Hola {name},</p>
            <p>Tu cuenta en SIGRENE ha sido aprobada. Ya puedes acceder a la plataforma:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="{login_url}" style="background: #004d98; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                    Acceder a SIGRENE
                </a>
            </div>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </div>
    </body>
    </html>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Tu cuenta ha sido aprobada",
        html_body=html,
        text_body=f"Hola {name}, tu cuenta ha sido aprobada. Accede a: {login_url}",
    )


def registration_pending_email(
    email: str,
    name: str,
    user_role: str,
) -> EmailMessage:
    """Template for pending registration notification to the user."""
    role_display = {
        "coach": "Entrenador",
        "swimmer": "Nadador",
        "admin_federacion": "Administrador de Federación",
    }.get(user_role, user_role)

    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #004d98; color: white; padding: 20px; text-align: center;">
            <h1>Solicitud de registro recibida</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <p>Hola {name},</p>
            <p>Hemos recibido tu solicitud de registro en SIGRENE con el rol de <strong>{role_display}</strong>.</p>
            <p>Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos por email cuando sea procesada.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </div>
    </body>
    </html>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Solicitud de registro recibida",
        html_body=html,
        text_body=f"Hola {name},\nHemos recibido tu solicitud de registro. Tu cuenta está pendiente de aprobación.",
    )


def account_rejected_email(
    email: str,
    name: str,
) -> EmailMessage:
    """Template for account rejection notification."""
    html = f"""
    <html>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #c81e1e; color: white; padding: 20px; text-align: center;">
            <h1>Solicitud de registro rechazada</h1>
        </div>
        <div style="padding: 20px; background: #f9f9f9;">
            <p>Hola {name},</p>
            <p>Lamentamos informarte que tu solicitud de registro en SIGRENE ha sido rechazada.</p>
            <p>Si crees que esto es un error, contacta con un administrador para más información.</p>
        </div>
        <div style="padding: 20px; text-align: center; color: #666; font-size: 12px;">
            <p>Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </div>
    </body>
    </html>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Solicitud de registro rechazada",
        html_body=html,
        text_body=f"Hola {name}, lamentamos informarte que tu solicitud ha sido rechazada.",
    )
