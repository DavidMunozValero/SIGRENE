"""Console email provider for development.

Prints emails to stdout instead of sending them.
Useful for local development without network calls.
"""

import sys
from typing import List

from app.services.email.base import BaseEmailProvider, EmailMessage


class ConsoleEmailProvider(BaseEmailProvider):
    """Email provider that prints to console instead of sending.

    Use in development or when EMAIL_PROVIDER=console.
    """

    def __init__(self):
        self._color_reset = "\033[0m"
        self._color_green = "\033[92m"

    async def send(self, message: EmailMessage) -> dict:
        """Print email to stdout for debugging."""
        print(f"{'='*60}", file=sys.stderr)
        print(f"{self._color_green}[EMAIL - CONSOLE PROVIDER]{self._color_reset}", file=sys.stderr)
        print(f"To: {', '.join(str(t) for t in message.to)}", file=sys.stderr)
        print(f"Subject: {message.subject}", file=sys.stderr)
        print(f"{'-'*60}", file=sys.stderr)
        print(message.html_body[:500] + ("..." if len(message.html_body) > 500 else ""), file=sys.stderr)
        print(f"{'='*60}{self._color_reset}\n", file=sys.stderr)
        return {"id": f"console-{id(message)}", "provider": "console"}

    async def send_batch(self, messages: List[EmailMessage]) -> List[dict]:
        """Print multiple emails to console."""
        return [{"success": True, "data": await self.send(msg)} for msg in messages]

    @property
    def provider_name(self) -> str:
        return "console"
