"""Email service factory.

Creates the appropriate email provider based on EMAIL_PROVIDER
environment variable. Defaults to console in development.
"""

import os
from app.services.email.base import BaseEmailProvider


def get_email_provider() -> BaseEmailProvider:
    """Factory function that returns the configured email provider.

    Provider selection via EMAIL_PROVIDER env var:
    - "resend": Resend API (production)
    - "console": Print to stdout (development)

    Environment variables required per provider:
    - RESEND_API_KEY (for resend provider)
    - EMAIL_FROM (optional, default sender address)
    """
    provider = os.environ.get("EMAIL_PROVIDER", "console").lower()

    if provider == "resend":
        from app.services.email.resend import ResendProvider
        return ResendProvider()

    if provider == "console":
        from app.services.email.console import ConsoleEmailProvider
        return ConsoleEmailProvider()

    raise ValueError(f"Unknown email provider: {provider}. Valid options: resend, console")


email_provider: BaseEmailProvider | None = None


def get_email_service() -> BaseEmailProvider:
    """Get or create the singleton email provider instance."""
    global email_provider
    if email_provider is None:
        email_provider = get_email_provider()
    return email_provider
