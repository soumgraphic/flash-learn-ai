"""Transactional Email Service using Resend with graceful local fallbacks.

Educational Note for Students:
------------------------------
Transactional emails (password resets, welcome notes, billing alerts) require:
1. High deliverability (DKIM, SPF, DMARC alignment).
2. Clean separation of concerns (HTML templating isolated from business domain logic).
3. Graceful degradation: in local test/dev environments without an API key, we LOG
   the message and reset link rather than failing or breaking developer workflows.
"""

from __future__ import annotations

import logging
from typing import Any

from app.core.config import settings

logger = logging.getLogger(__name__)


def build_password_reset_html(recipient_email: str, reset_url: str) -> str:
    """Builds a responsive, modern HTML email for password reset requests."""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your FlashLearn AI Password</title>
  <style>
    body {{
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0B0F19;
      color: #E2E8F0;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }}
    .wrapper {{
      max-width: 580px;
      margin: 40px auto;
      background: linear-gradient(180deg, #131B2E 0%, #0D1322 100%);
      border: 1px solid rgba(139, 92, 246, 0.25);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }}
    .header {{
      padding: 32px 32px 24px;
      text-align: center;
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }}
    .logo {{
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      text-decoration: none;
    }}
    .logo-badge {{
      background: linear-gradient(135deg, #6366F1 0%, #A855F7 100%);
      color: white;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 700;
    }}
    .content {{
      padding: 36px 32px;
      line-height: 1.6;
    }}
    h1 {{
      font-size: 20px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 16px;
      letter-spacing: -0.3px;
    }}
    p {{
      margin: 0 0 20px;
      color: #94A3B8;
      font-size: 15px;
    }}
    .button-container {{
      text-align: center;
      margin: 32px 0;
    }}
    .btn {{
      display: inline-block;
      background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      font-weight: 600;
      font-size: 15px;
      padding: 14px 32px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      letter-spacing: 0.2px;
    }}
    .info-box {{
      background: rgba(30, 41, 59, 0.6);
      border-left: 3px solid #8B5CF6;
      border-radius: 6px;
      padding: 14px 16px;
      margin: 24px 0;
      font-size: 13px;
      color: #CBD5E1;
    }}
    .footer {{
      padding: 24px 32px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #64748B;
      text-align: center;
      background: rgba(11, 15, 25, 0.5);
    }}
    .fallback-link {{
      word-break: break-all;
      color: #818CF8;
      font-size: 12px;
    }}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">
        <span class="logo-badge">⚡ FL</span> FlashLearn AI
      </div>
    </div>
    <div class="content">
      <h1>Password Reset Request</h1>
      <p>Hello,</p>
      <p>We received a request to reset the password for your FlashLearn AI account (<strong>{recipient_email}</strong>).</p>

      <div class="button-container">
        <a href="{reset_url}" target="_blank" class="btn">Reset My Password</a>
      </div>

      <div class="info-box">
        ⏳ <strong>Security Notice:</strong> This link is single-use and will automatically expire in <strong>15 minutes</strong>. If you did not request a password reset, no action is needed and your account remains safe.
      </div>

      <p style="font-size: 13px; color: #64748B; margin-top: 24px;">
        Button not working? Copy and paste this URL into your browser:
        <br>
        <a href="{reset_url}" class="fallback-link">{reset_url}</a>
      </p>
    </div>
    <div class="footer">
      &copy; FlashLearn AI &bull; Empowering students through active recall & flashcards.
    </div>
  </div>
</body>
</html>"""


class EmailService:
    """Manages transactional emails via Resend with local development logging fallback."""

    def __init__(self) -> None:
        self.api_key = settings.RESEND_API_KEY
        self.emails_from = settings.EMAILS_FROM
        self.frontend_url = settings.FRONTEND_URL.rstrip("/")

    async def send_password_reset_email(self, to_email: str, reset_token: str) -> dict[str, Any]:
        """Dispatches a password reset email via Resend or logs it in development."""
        reset_url = f"{self.frontend_url}/reset-password?token={reset_token}"
        subject = "Reset your FlashLearn AI password"
        html_content = build_password_reset_html(to_email, reset_url)

        if not self.api_key:
            logger.info(
                f"[EMAIL SERVICE - DEV FALLBACK] No RESEND_API_KEY configured.\n"
                f"  Recipient: {to_email}\n"
                f"  Subject: {subject}\n"
                f"  Reset Link: {reset_url}"
            )
            return {"status": "logged", "reset_url": reset_url}

        try:
            import resend

            resend.api_key = self.api_key
            params = {
                "from": self.emails_from,
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }

            response = resend.Emails.send(params)
            logger.info(
                f"[EMAIL SERVICE] Password reset email sent via Resend to {to_email} (id: {response.get('id') if isinstance(response, dict) else response})"
            )
            return {"status": "sent", "resend_id": getattr(response, "id", None) or response}
        except Exception as exc:
            logger.error(
                f"[EMAIL SERVICE ERROR] Failed to send email via Resend to {to_email}: {exc}",
                exc_info=True,
            )
            # Re-raise or return error status so service can respond cleanly
            return {"status": "error", "error": str(exc)}


email_service = EmailService()
