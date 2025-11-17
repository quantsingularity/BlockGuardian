"""
Enterprise security validation system for input sanitization and security checks
Implements comprehensive validation for financial data, user inputs, and security threats
"""

import hashlib
import html
import ipaddress
import json
import re
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional, Tuple, Union
from urllib.parse import urlparse

import bleach
from email_validator import EmailNotValidError, validate_email
from flask import current_app, request
from src.config import current_config


class ValidationError(Exception):
    """Custom validation error"""

    def __init__(self, message: str, field: str = None, code: str = None):
        self.message = message
        self.field = field
        self.code = code
        super().__init__(message)


class SecurityValidator:
    """Enterprise security validation system"""

    # Common regex patterns
    PATTERNS = {
        "username": re.compile(r"^[a-zA-Z0-9_]{3,30}$"),
        "password_strong": re.compile(
            r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
        ),
        "phone": re.compile(r"^\+?1?[2-9]\d{2}[2-9]\d{2}\d{4}$"),
        "ssn": re.compile(r"^\d{3}-?\d{2}-?\d{4}$"),
        "credit_card": re.compile(
            r"^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3[0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$"
        ),
        "routing_number": re.compile(r"^\d{9}$"),
        "account_number": re.compile(r"^\d{8,17}$"),
        "blockchain_address": re.compile(r"^(0x)?[0-9a-fA-F]{40}$"),
        "transaction_hash": re.compile(r"^(0x)?[0-9a-fA-F]{64}$"),
        "uuid": re.compile(
            r"^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$"
        ),
        "sql_injection": re.compile(
            r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
            re.IGNORECASE,
        ),
        "xss_basic": re.compile(
            r"<script[^>]*>.*?</script>", re.IGNORECASE | re.DOTALL
        ),
        "path_traversal": re.compile(r"\.\.[\\/]"),
    }

    # Allowed HTML tags for rich text content
    ALLOWED_HTML_TAGS = [
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
        "a",
        "img",
    ]

    ALLOWED_HTML_ATTRIBUTES = {
        "a": ["href", "title"],
        "img": ["src", "alt", "title", "width", "height"],
        "*": ["class", "id"],
    }

    def __init__(self):
        self.suspicious_patterns = [
            self.PATTERNS["sql_injection"],
            self.PATTERNS["xss_basic"],
            self.PATTERNS["path_traversal"],
        ]

    def validate_email(self, email: str) -> str:
        """
        Validate and normalize email address

        Args:
            email: Email address to validate

        Returns:
            Normalized email address

        Raises:
            ValidationError: If email is invalid
        """
        if not email:
            raise ValidationError("Email is required", "email", "REQUIRED")

        try:
            # Validate email format and deliverability
            validation = validate_email(email)
            return validation.email
        except EmailNotValidError as e:
            raise ValidationError(
                f"Invalid email address: {str(e)}", "email", "INVALID_FORMAT"
            )

    def validate_password(self, password: str, require_strong: bool = True) -> bool:
        """
        Validate password strength

        Args:
            password: Password to validate
            require_strong: Whether to require strong password

        Returns:
            True if password is valid

        Raises:
            ValidationError: If password is invalid
        """
        if not password:
            raise ValidationError("Password is required", "password", "REQUIRED")

        if len(password) < 8:
            raise ValidationError(
                "Password must be at least 8 characters long", "password", "TOO_SHORT"
            )

        if len(password) > 128:
            raise ValidationError(
                "Password must be less than 128 characters", "password", "TOO_LONG"
            )

        if require_strong:
            if not self.PATTERNS["password_strong"].match(password):
                raise ValidationError(
                    "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
                    "password",
                    "WEAK_PASSWORD",
                )

        # Check for common weak passwords
        weak_passwords = ["password", "123456", "qwerty", "admin", "letmein"]
        if password.lower() in weak_passwords:
            raise ValidationError(
                "Password is too common", "password", "COMMON_PASSWORD"
            )

        return True

    def validate_username(self, username: str) -> str:
        """
        Validate username format

        Args:
            username: Username to validate

        Returns:
            Validated username

        Raises:
            ValidationError: If username is invalid
        """
        if not username:
            raise ValidationError("Username is required", "username", "REQUIRED")

        if not self.PATTERNS["username"].match(username):
            raise ValidationError(
                "Username must be 3-30 characters long and contain only letters, numbers, and underscores",
                "username",
                "INVALID_FORMAT",
            )

        # Check for reserved usernames
        reserved_usernames = ["admin", "root", "system", "api", "www", "mail", "ftp"]
        if username.lower() in reserved_usernames:
            raise ValidationError("Username is reserved", "username", "RESERVED")

        return username.lower()

    def validate_financial_amount(
        self,
        amount: Union[str, float, Decimal],
        min_amount: float = 0.01,
        max_amount: float = 1000000,
    ) -> Decimal:
        """
        Validate financial amount

        Args:
            amount: Amount to validate
            min_amount: Minimum allowed amount
            max_amount: Maximum allowed amount

        Returns:
            Validated amount as Decimal

        Raises:
            ValidationError: If amount is invalid
        """
        if amount is None:
            raise ValidationError("Amount is required", "amount", "REQUIRED")

        try:
            # Convert to Decimal for precise financial calculations
            if isinstance(amount, str):
                # Remove currency symbols and whitespace
                cleaned_amount = re.sub(r"[^\d.-]", "", amount)
                decimal_amount = Decimal(cleaned_amount)
            else:
                decimal_amount = Decimal(str(amount))
        except (InvalidOperation, ValueError):
            raise ValidationError("Invalid amount format", "amount", "INVALID_FORMAT")

        if decimal_amount < Decimal(str(min_amount)):
            raise ValidationError(
                f"Amount must be at least {min_amount}", "amount", "TOO_SMALL"
            )

        if decimal_amount > Decimal(str(max_amount)):
            raise ValidationError(
                f"Amount must be less than {max_amount}", "amount", "TOO_LARGE"
            )

        # Check for reasonable decimal places (max 8 for crypto, 2 for fiat)
        if decimal_amount.as_tuple().exponent < -8:
            raise ValidationError(
                "Amount has too many decimal places", "amount", "TOO_PRECISE"
            )

        return decimal_amount

    def validate_blockchain_address(
        self, address: str, network: str = "ethereum"
    ) -> str:
        """
        Validate blockchain address format

        Args:
            address: Blockchain address to validate
            network: Blockchain network (ethereum, bitcoin, etc.)

        Returns:
            Validated address

        Raises:
            ValidationError: If address is invalid
        """
        if not address:
            raise ValidationError(
                "Blockchain address is required", "address", "REQUIRED"
            )

        # Remove whitespace
        address = address.strip()

        if network.lower() == "ethereum":
            if not self.PATTERNS["blockchain_address"].match(address):
                raise ValidationError(
                    "Invalid Ethereum address format", "address", "INVALID_FORMAT"
                )

            # Validate checksum if present
            if any(c.isupper() for c in address[2:]):  # Has mixed case (checksum)
                if not self._validate_ethereum_checksum(address):
                    raise ValidationError(
                        "Invalid Ethereum address checksum",
                        "address",
                        "INVALID_CHECKSUM",
                    )

        return address.lower()

    def validate_transaction_hash(self, tx_hash: str) -> str:
        """
        Validate transaction hash format

        Args:
            tx_hash: Transaction hash to validate

        Returns:
            Validated transaction hash

        Raises:
            ValidationError: If hash is invalid
        """
        if not tx_hash:
            raise ValidationError("Transaction hash is required", "tx_hash", "REQUIRED")

        tx_hash = tx_hash.strip()

        if not self.PATTERNS["transaction_hash"].match(tx_hash):
            raise ValidationError(
                "Invalid transaction hash format", "tx_hash", "INVALID_FORMAT"
            )

        return tx_hash.lower()

    def validate_phone_number(self, phone: str) -> str:
        """
        Validate phone number format

        Args:
            phone: Phone number to validate

        Returns:
            Validated phone number

        Raises:
            ValidationError: If phone number is invalid
        """
        if not phone:
            raise ValidationError("Phone number is required", "phone", "REQUIRED")

        # Remove all non-digit characters except +
        cleaned_phone = re.sub(r"[^\d+]", "", phone)

        if not self.PATTERNS["phone"].match(cleaned_phone):
            raise ValidationError(
                "Invalid phone number format", "phone", "INVALID_FORMAT"
            )

        return cleaned_phone

    def validate_date_range(
        self,
        start_date: Union[str, date, datetime],
        end_date: Union[str, date, datetime],
    ) -> Tuple[date, date]:
        """
        Validate date range

        Args:
            start_date: Start date
            end_date: End date

        Returns:
            Tuple of validated dates

        Raises:
            ValidationError: If date range is invalid
        """
        # Convert strings to date objects
        if isinstance(start_date, str):
            try:
                start_date = datetime.fromisoformat(start_date).date()
            except ValueError:
                raise ValidationError(
                    "Invalid start date format", "start_date", "INVALID_FORMAT"
                )

        if isinstance(end_date, str):
            try:
                end_date = datetime.fromisoformat(end_date).date()
            except ValueError:
                raise ValidationError(
                    "Invalid end date format", "end_date", "INVALID_FORMAT"
                )

        # Convert datetime to date if needed
        if isinstance(start_date, datetime):
            start_date = start_date.date()
        if isinstance(end_date, datetime):
            end_date = end_date.date()

        # Validate range
        if start_date > end_date:
            raise ValidationError(
                "Start date must be before end date", "date_range", "INVALID_RANGE"
            )

        # Check for reasonable date range (not more than 10 years)
        if (end_date - start_date).days > 3650:
            raise ValidationError(
                "Date range is too large (max 10 years)",
                "date_range",
                "RANGE_TOO_LARGE",
            )

        return start_date, end_date

    def sanitize_html(self, html_content: str) -> str:
        """
        Sanitize HTML content to prevent XSS attacks

        Args:
            html_content: HTML content to sanitize

        Returns:
            Sanitized HTML content
        """
        if not html_content:
            return ""

        # Use bleach to sanitize HTML
        sanitized = bleach.clean(
            html_content,
            tags=self.ALLOWED_HTML_TAGS,
            attributes=self.ALLOWED_HTML_ATTRIBUTES,
            strip=True,
        )

        return sanitized

    def validate_json_input(
        self, json_data: Union[str, dict], max_size: int = 1024 * 1024
    ) -> dict:
        """
        Validate JSON input

        Args:
            json_data: JSON data to validate
            max_size: Maximum size in bytes

        Returns:
            Validated JSON data

        Raises:
            ValidationError: If JSON is invalid
        """
        if isinstance(json_data, str):
            if len(json_data.encode("utf-8")) > max_size:
                raise ValidationError("JSON data is too large", "json", "TOO_LARGE")

            try:
                json_data = json.loads(json_data)
            except json.JSONDecodeError as e:
                raise ValidationError(
                    f"Invalid JSON format: {str(e)}", "json", "INVALID_FORMAT"
                )

        if not isinstance(json_data, dict):
            raise ValidationError("JSON data must be an object", "json", "INVALID_TYPE")

        return json_data

    def check_security_threats(self, input_data: str) -> List[str]:
        """
        Check input for common security threats

        Args:
            input_data: Input data to check

        Returns:
            List of detected threats
        """
        threats = []

        if not input_data:
            return threats

        # Check for SQL injection patterns
        if self.PATTERNS["sql_injection"].search(input_data):
            threats.append("sql_injection")

        # Check for XSS patterns
        if self.PATTERNS["xss_basic"].search(input_data):
            threats.append("xss")

        # Check for path traversal
        if self.PATTERNS["path_traversal"].search(input_data):
            threats.append("path_traversal")

        # Check for suspicious file extensions
        suspicious_extensions = [".exe", ".bat", ".cmd", ".scr", ".pif", ".com"]
        if any(ext in input_data.lower() for ext in suspicious_extensions):
            threats.append("suspicious_file")

        return threats

    def validate_ip_address(self, ip_address: str) -> str:
        """
        Validate IP address format

        Args:
            ip_address: IP address to validate

        Returns:
            Validated IP address

        Raises:
            ValidationError: If IP address is invalid
        """
        if not ip_address:
            raise ValidationError("IP address is required", "ip_address", "REQUIRED")

        try:
            # Validate IPv4 or IPv6
            ip_obj = ipaddress.ip_address(ip_address)

            # Check for private/reserved addresses in production
            if current_config.APP_NAME == "production":
                if ip_obj.is_private or ip_obj.is_reserved or ip_obj.is_loopback:
                    raise ValidationError(
                        "Private/reserved IP addresses not allowed",
                        "ip_address",
                        "PRIVATE_IP",
                    )

            return str(ip_obj)

        except ValueError:
            raise ValidationError(
                "Invalid IP address format", "ip_address", "INVALID_FORMAT"
            )

    def validate_url(self, url: str, allowed_schemes: List[str] = None) -> str:
        """
        Validate URL format and scheme

        Args:
            url: URL to validate
            allowed_schemes: List of allowed URL schemes

        Returns:
            Validated URL

        Raises:
            ValidationError: If URL is invalid
        """
        if not url:
            raise ValidationError("URL is required", "url", "REQUIRED")

        if allowed_schemes is None:
            allowed_schemes = ["http", "https"]

        try:
            parsed = urlparse(url)

            if not parsed.scheme:
                raise ValidationError(
                    "URL must include scheme (http/https)", "url", "MISSING_SCHEME"
                )

            if parsed.scheme not in allowed_schemes:
                raise ValidationError(
                    f"URL scheme must be one of: {', '.join(allowed_schemes)}",
                    "url",
                    "INVALID_SCHEME",
                )

            if not parsed.netloc:
                raise ValidationError(
                    "URL must include domain", "url", "MISSING_DOMAIN"
                )

            return url

        except Exception as e:
            raise ValidationError(
                f"Invalid URL format: {str(e)}", "url", "INVALID_FORMAT"
            )

    def _validate_ethereum_checksum(self, address: str) -> bool:
        """
        Validate Ethereum address checksum (EIP-55)

        Args:
            address: Ethereum address with checksum

        Returns:
            True if checksum is valid
        """
        address = address[2:]  # Remove 0x prefix
        address_hash = hashlib.sha3_256(address.lower().encode()).hexdigest()

        for i, char in enumerate(address):
            if char.isalpha():
                # Character should be uppercase if corresponding hex digit >= 8
                if int(address_hash[i], 16) >= 8:
                    if char.islower():
                        return False
                else:
                    if char.isupper():
                        return False

        return True

    def validate_request_size(self, max_size: int = 10 * 1024 * 1024):  # 10MB default
        """
        Validate request content length

        Args:
            max_size: Maximum allowed request size in bytes

        Raises:
            ValidationError: If request is too large
        """
        if request and request.content_length:
            if request.content_length > max_size:
                raise ValidationError(
                    f"Request too large. Maximum size: {max_size} bytes",
                    "request_size",
                    "TOO_LARGE",
                )

    def validate_file_upload(
        self,
        file_data: bytes,
        filename: str,
        allowed_extensions: List[str] = None,
        max_size: int = 5 * 1024 * 1024,
    ) -> bool:
        """
        Validate file upload

        Args:
            file_data: File content
            filename: Original filename
            allowed_extensions: List of allowed file extensions
            max_size: Maximum file size in bytes

        Returns:
            True if file is valid

        Raises:
            ValidationError: If file is invalid
        """
        if not file_data:
            raise ValidationError("File data is required", "file", "REQUIRED")

        if len(file_data) > max_size:
            raise ValidationError(
                f"File too large. Maximum size: {max_size} bytes", "file", "TOO_LARGE"
            )

        if allowed_extensions:
            file_ext = filename.lower().split(".")[-1] if "." in filename else ""
            if file_ext not in allowed_extensions:
                raise ValidationError(
                    f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}",
                    "file",
                    "INVALID_TYPE",
                )

        # Check for malicious file signatures
        malicious_signatures = [
            b"\x4d\x5a",  # PE executable
            b"\x50\x4b\x03\x04",  # ZIP (could contain malicious files)
        ]

        for signature in malicious_signatures:
            if file_data.startswith(signature):
                raise ValidationError("File type not allowed", "file", "MALICIOUS_FILE")

        return True


# Global security validator instance
security_validator = SecurityValidator()
