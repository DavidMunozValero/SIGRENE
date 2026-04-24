"""Resend email provider implementation."""

import os
from typing import List
import httpx

from app.services.email.base import BaseEmailProvider, EmailMessage


class ResendProvider(BaseEmailProvider):
    """Resend email service provider.

    Requires RESEND_API_KEY environment variable.
    Free tier: 3,000 emails/day, 10,000/month.
    """

    def __init__(self):
        self.api_key = os.environ.get("RESEND_API_KEY")
        self.from_email = os.environ.get("EMAIL_FROM", "SIGRENE <noreply@sigrene.es>")
        self.base_url = "https://api.resend.com"

    async def send(self, message: EmailMessage) -> dict:
        """Send a single email via Resend API."""
        if not self.api_key:
            raise RuntimeError("RESEND_API_KEY not configured")

        payload = {
            "from": message.from_email or self.from_email,
            "to": message.to,
            "subject": message.subject,
            "html": message.html_body,
        }
        if message.text_body:
            payload["text"] = message.text_body

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/emails",
                json=payload,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()

    async def send_batch(self, messages: List[EmailMessage]) -> List[dict]:
        """Send multiple emails via Resend batch API."""
        if not self.api_key:
            raise RuntimeError("RESEND_API_KEY not configured")

        results = []
        async with httpx.AsyncClient() as client:
            for message in messages:
                try:
                    result = await self.send(message)
                    results.append({"success": True, "data": result})
                except Exception as e:
                    results.append({"success": False, "error": str(e)})
        return results

    @property
    def provider_name(self) -> str:
        return "resend"
