"""Abstract email service interface.

This module defines the base interface for email providers, allowing
the application to switch providers without changing business logic.
"""

from abc import ABC, abstractmethod
from typing import Optional, List
from pydantic import BaseModel, EmailStr


class EmailMessage(BaseModel):
    """Standard email message format across all providers."""
    to: List[EmailStr]
    subject: str
    html_body: str
    text_body: Optional[str] = None
    from_email: Optional[str] = None
    from_name: Optional[str] = None


class BaseEmailProvider(ABC):
    """Abstract base class for email providers."""

    @abstractmethod
    async def send(self, message: EmailMessage) -> dict:
        """Send an email. Returns provider-specific response."""
        pass

    @abstractmethod
    async def send_batch(self, messages: List[EmailMessage]) -> List[dict]:
        """Send multiple emails in batch."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Return the provider name for logging."""
        pass
