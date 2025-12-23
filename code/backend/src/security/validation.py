"""
Input validation and security checking system for BlockGuardian Backend
Implements comprehensive validation for all user inputs and security threat detection
"""

import re
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional
from flask import request
import bleach


class ValidationError(Exception):
    """Custom validation exception"""

    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field
        super().__init__(self.message)


class SecurityValidator:
    """Enterprise-grade input validation and security checker"""

    def __init__(self):
        self.max_request_size = 10 * 1024 * 1024  # 10MB
        self.email_pattern = re.compile(
            r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        )
        self.username_pattern = re.compile(r"^[a-zA-Z0-9_-]{3,32}$")
        self.phone_pattern = re.compile(r"^\+?[1-9]\d{1,14}$")

        # Security threat patterns
        self.sql_injection_patterns = [
            r"(\bOR\b|\bAND\b).*['\"]?\s*=\s*['\"]?",
            r"UNION\s+SELECT",
            r"DROP\s+TABLE",
            r"INSERT\s+INTO",
            r"DELETE\s+FROM",
            r"--\s*$",
            r"/\*.*\*/",
            r"xp_cmdshell",
            r"exec\s*\(",
        ]

        self.xss_patterns = [
            r"<script[^>]*>.*?</script>",
            r"javascript:",
            r"on\w+\s*=",
            r"<iframe",
            r"<object",
            r"<embed",
        ]

        self.command_injection_patterns = [
            r";\s*\w+",
            r"\|\s*\w+",
            r"&&\s*\w+",
            r"`.*`",
            r"\$\(.*\)",
        ]

    def validate_request_size(self) -> None:
        """Validate request content length"""
        content_length = request.content_length
        if content_length and content_length > self.max_request_size:
            raise ValidationError(
                f"Request size exceeds maximum allowed size of {self.max_request_size} bytes"
            )

    def validate_json_input(self, data: Optional[Dict]) -> Dict:
        """Validate and sanitize JSON input"""
        if data is None:
            raise ValidationError("Request body is required")

        if not isinstance(data, dict):
            raise ValidationError("Request body must be a JSON object")

        return data

    def validate_email(self, email: str) -> str:
        """Validate email address format"""
        if not email or not isinstance(email, str):
            raise ValidationError("Email is required", "email")

        email = email.strip().lower()

        if len(email) > 254:
            raise ValidationError("Email is too long", "email")

        if not self.email_pattern.match(email):
            raise ValidationError("Invalid email format", "email")

        return email

    def validate_username(self, username: str) -> str:
        """Validate username format"""
        if not username or not isinstance(username, str):
            raise ValidationError("Username is required", "username")

        username = username.strip()

        if not self.username_pattern.match(username):
            raise ValidationError(
                "Username must be 3-32 characters and contain only letters, numbers, underscores, and hyphens",
                "username",
            )

        return username

    def validate_password(self, password: str) -> None:
        """Validate password strength"""
        if not password or not isinstance(password, str):
            raise ValidationError("Password is required", "password")

        if len(password) < 12:
            raise ValidationError(
                "Password must be at least 12 characters long", "password"
            )

        if len(password) > 128:
            raise ValidationError("Password is too long", "password")

        if not re.search(r"[A-Z]", password):
            raise ValidationError(
                "Password must contain at least one uppercase letter", "password"
            )

        if not re.search(r"[a-z]", password):
            raise ValidationError(
                "Password must contain at least one lowercase letter", "password"
            )

        if not re.search(r"\d", password):
            raise ValidationError(
                "Password must contain at least one digit", "password"
            )

        if not re.search(r"[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]", password):
            raise ValidationError(
                "Password must contain at least one special character", "password"
            )

    def validate_phone(self, phone: str) -> str:
        """Validate phone number format"""
        if not phone or not isinstance(phone, str):
            raise ValidationError("Phone number is required", "phone")

        phone = re.sub(r"\s+", "", phone)

        if not self.phone_pattern.match(phone):
            raise ValidationError("Invalid phone number format", "phone")

        return phone

    def validate_financial_amount(self, amount: Any) -> Decimal:
        """Validate financial amount"""
        try:
            if isinstance(amount, str):
                amount = Decimal(amount)
            elif isinstance(amount, (int, float)):
                amount = Decimal(str(amount))
            elif isinstance(amount, Decimal):
                pass
            else:
                raise ValidationError("Invalid amount format", "amount")

            if amount < 0:
                raise ValidationError("Amount cannot be negative", "amount")

            if amount > Decimal("999999999999.99"):
                raise ValidationError("Amount is too large", "amount")

            return amount
        except InvalidOperation:
            raise ValidationError("Invalid amount format", "amount")

    def sanitize_html(self, html_content: str) -> str:
        """Sanitize HTML content to prevent XSS"""
        if not html_content:
            return html_content

        allowed_tags = [
            "p",
            "br",
            "strong",
            "em",
            "u",
            "ol",
            "ul",
            "li",
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "blockquote",
            "code",
            "pre",
        ]

        allowed_attributes = {
            "*": ["class"],
            "a": ["href", "title"],
        }

        return bleach.clean(
            html_content, tags=allowed_tags, attributes=allowed_attributes, strip=True
        )

    def check_security_threats(self, input_string: str) -> List[str]:
        """Check for common security threats in input"""
        if not input_string:
            return []

        threats = []

        # Check for SQL injection
        for pattern in self.sql_injection_patterns:
            if re.search(pattern, input_string, re.IGNORECASE):
                threats.append("sql_injection")
                break

        # Check for XSS
        for pattern in self.xss_patterns:
            if re.search(pattern, input_string, re.IGNORECASE):
                threats.append("xss")
                break

        # Check for command injection
        for pattern in self.command_injection_patterns:
            if re.search(pattern, input_string):
                threats.append("command_injection")
                break

        return threats

    def validate_date_range(self, start_date: str, end_date: str) -> tuple:
        """Validate date range"""
        from datetime import datetime

        try:
            start = datetime.fromisoformat(start_date)
            end = datetime.fromisoformat(end_date)

            if start > end:
                raise ValidationError("Start date must be before end date")

            return start, end
        except ValueError:
            raise ValidationError("Invalid date format. Use ISO format (YYYY-MM-DD)")

    def validate_pagination(
        self, page: int, per_page: int, max_per_page: int = 100
    ) -> tuple:
        """Validate pagination parameters"""
        if page < 1:
            raise ValidationError("Page must be at least 1")

        if per_page < 1:
            raise ValidationError("Per page must be at least 1")

        if per_page > max_per_page:
            per_page = max_per_page

        return page, per_page


# Global instance
security_validator = SecurityValidator()
