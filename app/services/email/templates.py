"""Email templates for SIGRENE notifications."""

from typing import Optional
from app.services.email.base import EmailMessage

LOGO_SVG = """<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="white" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 12c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>
  <path d="M2 17c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2"/>
  <path d="M2 7c2 0 2-2 4-2s2 2 4 2 2-2 4-2 2 2 4 2 2-2 4-2" opacity="0.6"/>
</svg>"""

BASE_STYLES = """* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; }
"""

EMAIL_CONTAINER = """width: 100%; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);"""

HEADER = """background: linear-gradient(135deg, #004d98 0%, #0077cc 100%); padding: 40px 32px; text-align: center;"""

CONTENT = """padding: 40px 32px;"""

BUTTON_PRIMARY = """display: inline-block; background: linear-gradient(135deg, #004d98 0%, #0077cc 100%); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; margin: 8px 0;"""

BUTTON_SECONDARY = """display: inline-block; background: #f1f5f9; color: #334155; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 500; font-size: 14px;"""

FOOTER = """padding: 24px 32px; background: #f8fafc; text-align: center; border-top: 1px solid #e2e8f0;"""

def _build_email(html_body: str, preheader: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SIGRENE</title>
    {f'<meta name="description" content="{preheader}">' if preheader else ''}
</head>
<body style="{BASE_STYLES}">
    <table width="100%" cellpadding="0" cellspacing="0" style="{EMAIL_CONTAINER}">
        {html_body}
    </table>
</body>
</html>"""


def contact_form_notification(
    name: str,
    email: str,
    subject: str,
    message: str,
    admin_email: str = "admin@sigrene.es",
) -> EmailMessage:
    """Template for contact form submissions."""
    html_body = f"""
    <tr>
        <td style="{HEADER}">
            {LOGO_SVG}
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 16px;">Nuevo mensaje de contacto</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">SIGRENE — Plataforma de Gestión</p>
        </td>
    </tr>
    <tr>
        <td style="{CONTENT}">
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Nombre</span>
                            <p style="color: #1e293b; font-size: 16px; margin-top: 4px;">{name}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                            <p style="color: #1e293b; font-size: 16px; margin-top: 4px;"><a href="mailto:{email}" style="color: #004d98;">{email}</a></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Asunto</span>
                            <p style="color: #1e293b; font-size: 16px; margin-top: 4px;">{subject}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Mensaje</span>
                            <p style="color: #1e293b; font-size: 16px; margin-top: 4px; line-height: 1.6;">{message}</p>
                        </td>
                    </tr>
                </table>
            </div>
        </td>
    </tr>
    <tr>
        <td style="{FOOTER}">
            <p style="color: #64748b; font-size: 13px;">Este mensaje fue enviado a través del formulario de contacto de SIGRENE.</p>
        </td>
    </tr>
    """
    return EmailMessage(
        to=[admin_email],
        subject=f"[SIGRENE] Contacto: {subject}",
        html_body=_build_email(html_body, f"Nuevo mensaje de contacto de {name}"),
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
        "director_tecnico": "Director Técnico",
        "coach": "Entrenador",
        "swimmer": "Nadador",
    }.get(user_role, user_role)

    html_body = f"""
    <tr>
        <td style="{HEADER}">
            {LOGO_SVG}
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 16px;">Nuevo registro pendiente</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">Un nuevo usuario solicita acceso</p>
        </td>
    </tr>
    <tr>
        <td style="{CONTENT}">
            <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Nombre</span>
                            <p style="color: #1e293b; font-size: 16px; margin-top: 4px;">{user_name}</p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; border-bottom: 1px solid #e2e8f0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                            <p style="color: #1e293b; font-size: 16px; margin-top: 4px;"><a href="mailto:{user_email}" style="color: #004d98;">{user_email}</a></p>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0;">
                            <span style="color: #64748b; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Rol solicitado</span>
                            <p style="color: #1e293b; font-size: 16px; margin-top: 4px; font-weight: 600;">{role_display}</p>
                        </td>
                    </tr>
                </table>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Este usuario está pendiente de aprobación. Accede al panel de administración para revisar su solicitud.</p>
        </td>
    </tr>
    <tr>
        <td style="{FOOTER}">
            <p style="color: #64748b; font-size: 13px;">Notificación automática de SIGRENE</p>
        </td>
    </tr>
    """
    return EmailMessage(
        to=[admin_email],
        subject=f"[SIGRENE] Nuevo registro pendiente: {user_name}",
        html_body=_build_email(html_body, f"Nuevo usuario registrado: {user_name}"),
        text_body=f"Nuevo registro:\nNombre: {user_name}\nEmail: {user_email}\nRol: {role_display}",
    )


def password_recovery_email(
    email: str,
    reset_url: str,
    expires_minutes: int = 30,
) -> EmailMessage:
    """Template for password recovery emails."""
    html_body = f"""
    <tr>
        <td style="{HEADER}">
            {LOGO_SVG}
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 16px;">Restablecer contraseña</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">Solicitud de recuperación</p>
        </td>
    </tr>
    <tr>
        <td style="{CONTENT}">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hola,</p>
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Has solicitado restablecer tu contraseña en SIGRENE. Haz clic en el siguiente botón para crear una nueva:</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{reset_url}" style="{BUTTON_PRIMARY}">Restablecer contraseña</a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Este enlace expira en <strong>{expires_minutes} minutos</strong>.</p>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 16px;">Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña actual seguirá siendo válida.</p>
        </td>
    </tr>
    <tr>
        <td style="{FOOTER}">
            <p style="color: #64748b; font-size: 13px;">Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </td>
    </tr>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Restablecer contraseña",
        html_body=_build_email(html_body, "Solicitud de restablecimiento de contraseña"),
        text_body=f"Recupera tu contraseña en: {reset_url}\nEste enlace expira en {expires_minutes} minutos.",
    )


def account_approved_email(
    email: str,
    name: str,
    login_url: str = "https://sigrene.vercel.app/login",
) -> EmailMessage:
    """Template for account approval notification."""
    html_body = f"""
    <tr>
        <td style="{HEADER}">
            {LOGO_SVG}
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 16px;">¡Cuenta aprobada!</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">Ya puedes acceder a la plataforma</p>
        </td>
    </tr>
    <tr>
        <td style="{CONTENT}">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hola <strong>{name}</strong>,</p>
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Tu cuenta en SIGRENE ha sido aprobada. Ya puedes acceder a la plataforma y comenzar a usarla:</p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{login_url}" style="{BUTTON_PRIMARY}">Acceder a SIGRENE</a>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Bienvenido/a a la plataforma.</p>
        </td>
    </tr>
    <tr>
        <td style="{FOOTER}">
            <p style="color: #64748b; font-size: 13px;">Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </td>
    </tr>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Tu cuenta ha sido aprobada",
        html_body=_build_email(html_body, "Tu cuenta ha sido aprobada - Ya puedes acceder"),
        text_body=f"Hola {name}, tu cuenta ha sido aprobada. Accede a: {login_url}",
    )


def registration_pending_email(
    email: str,
    name: str,
    user_role: str,
) -> EmailMessage:
    """Template for pending registration notification to the user."""
    role_display = {
        "director_tecnico": "Director Técnico",
        "coach": "Entrenador",
        "swimmer": "Nadador",
    }.get(user_role, user_role)

    html_body = f"""
    <tr>
        <td style="{HEADER}">
            {LOGO_SVG}
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 16px;">Solicitud recibida</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">Tu registro está en revisión</p>
        </td>
    </tr>
    <tr>
        <td style="{CONTENT}">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hola <strong>{name}</strong>,</p>
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hemos recibido tu solicitud de registro en SIGRENE con el rol de <strong>{role_display}</strong>.</p>
            <div style="background: #fef3c7; border-radius: 12px; padding: 16px; margin: 24px 0;">
                <p style="color: #92400e; font-size: 14px; line-height: 1.6;">Tu cuenta está pendiente de aprobación por un administrador. Te notificaremos por email cuando sea procesada.</p>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Gracias por tu paciencia.</p>
        </td>
    </tr>
    <tr>
        <td style="{FOOTER}">
            <p style="color: #64748b; font-size: 13px;">Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </td>
    </tr>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Solicitud de registro recibida",
        html_body=_build_email(html_body, "Hemos recibido tu solicitud - Pendiente de aprobación"),
        text_body=f"Hola {name},\nHemos recibido tu solicitud de registro. Tu cuenta está pendiente de aprobación.",
    )


def account_rejected_email(
    email: str,
    name: str,
) -> EmailMessage:
    """Template for account rejection notification."""
    html_body = f"""
    <tr>
        <td style="background: linear-gradient(135deg, #991b1b 0%, #dc2626 100%); padding: 40px 32px; text-align: center;">
            {LOGO_SVG}
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 16px;">Solicitud rechazada</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">Registro no aprobado</p>
        </td>
    </tr>
    <tr>
        <td style="{CONTENT}">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Hola <strong>{name}</strong>,</p>
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">Lamentamos informarte que tu solicitud de registro en SIGRENE ha sido rechazada.</p>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6;">Si crees que esto es un error, contacta con un administrador de la plataforma para más información.</p>
        </td>
    </tr>
    <tr>
        <td style="{FOOTER}">
            <p style="color: #64748b; font-size: 13px;">Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </td>
    </tr>
    """
    return EmailMessage(
        to=[email],
        subject="[SIGRENE] Solicitud de registro rechazada",
        html_body=_build_email(html_body, "Tu solicitud de registro ha sido rechazada"),
        text_body=f"Hola {name}, lamentamos informarte que tu solicitud ha sido rechazada.",
    )


def invitation_email(
    email: str,
    name: str,
    inviting_organization: str,
    role_assigned: str,
    invitation_url: str,
    expires_days: int = 7,
) -> EmailMessage:
    """Template for invitation emails."""
    role_display = {
        "director_tecnico": "Director Técnico",
        "coach": "Entrenador",
        "swimmer": "Nadador",
    }.get(role_assigned, role_assigned)

    role_badge = {
        "director_tecnico": "#7c3aed",
        "coach": "#0891b2",
        "swimmer": "#059669",
    }.get(role_assigned, "#64748b")

    html_body = f"""
    <tr>
        <td style="{HEADER}">
            {LOGO_SVG}
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin-top: 16px;">Invitación a SIGRENE</h1>
            <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin-top: 8px;">Un nuevo reto te espera</p>
        </td>
    </tr>
    <tr>
        <td style="{CONTENT}">
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Hola <strong>{name}</strong>,
            </p>
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 16px;">
                Has sido invitado/a a unirte a <strong>SIGRENE</strong> como:
            </p>
            <div style="text-align: center; margin: 24px 0;">
                <span style="display: inline-block; background: {role_badge}; color: #ffffff; padding: 12px 24px; border-radius: 100px; font-size: 18px; font-weight: 600;">
                    {role_display}
                </span>
            </div>
            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                por <strong>{inviting_organization}</strong>
            </p>
            <p style="color: #1e293b; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                Completa tu registro para crear tu cuenta personal:
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="{invitation_url}" style="{BUTTON_PRIMARY}">Aceptar invitación</a>
            </div>
            <p style="color: #64748b; font-size: 13px; line-height: 1.6;">
                Este enlace expira en <strong>{expires_days} días</strong>.
            </p>
            <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin-top: 12px;">
                Si no solicitaste esta invitación, puedes ignorar este email.
            </p>
        </td>
    </tr>
    <tr>
        <td style="{FOOTER}">
            <p style="color: #64748b; font-size: 13px;">Este es un email automático de SIGRENE. No respondas a este mensaje.</p>
        </td>
    </tr>
    """
    return EmailMessage(
        to=[email],
        subject=f"[SIGRENE] Invitación como {role_display}",
        html_body=_build_email(html_body, f"Has sido invitado como {role_display} a SIGRENE"),
        text_body=f"Hola {name}, has sido invitado a SIGRENE como {role_display}. Acepta tu invitación en: {invitation_url}\nEste enlace expira en {expires_days} días.",
    )
