"""
Enterprise-grade encryption manager for sensitive data protection
Implements field-level encryption, key rotation, and secure data handling
"""

import base64
import hashlib
import json
import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union

from cryptography.fernet import Fernet, MultiFernet
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding, rsa
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from src.config import current_config


class EncryptionManager:
    """Enterprise encryption manager with key rotation and multiple encryption methods"""

    def __init__(self):
        self.primary_key = current_config.security.encryption_key
        self.fernet = Fernet(self.primary_key)
        self.multi_fernet = None
        self._initialize_key_rotation()

    def _initialize_key_rotation(self):
        """Initialize key rotation system"""
        # In production, these would be loaded from a secure key management system
        rotation_keys = [
            self.primary_key,
            # Add rotated keys here for backward compatibility
        ]

        fernet_keys = [Fernet(key) for key in rotation_keys]
        self.multi_fernet = MultiFernet(fernet_keys)

    def encrypt_field(
        self, data: Union[str, dict, list], field_type: str = "general"
    ) -> str:
        """
        Encrypt sensitive field data with metadata

        Args:
            data: Data to encrypt
            field_type: Type of field (pii, financial, credentials, etc.)

        Returns:
            Base64 encoded encrypted data with metadata
        """
        if data is None:
            return None

        # Convert data to string if needed
        if isinstance(data, (dict, list)):
            data_str = json.dumps(data)
        else:
            data_str = str(data)

        # Create encryption metadata
        metadata = {
            "field_type": field_type,
            "encrypted_at": datetime.utcnow().isoformat(),
            "encryption_version": "1.0",
        }

        # Combine metadata and data
        payload = {"metadata": metadata, "data": data_str}

        # Encrypt the payload
        encrypted_data = self.fernet.encrypt(json.dumps(payload).encode())

        # Return base64 encoded for database storage
        return base64.b64encode(encrypted_data).decode()

    def decrypt_field(self, encrypted_data: str) -> Any:
        """
        Decrypt field data and return original value

        Args:
            encrypted_data: Base64 encoded encrypted data

        Returns:
            Decrypted original data
        """
        if not encrypted_data:
            return None

        try:
            # Decode from base64
            encrypted_bytes = base64.b64decode(encrypted_data.encode())

            # Decrypt using multi-fernet for key rotation support
            decrypted_bytes = self.multi_fernet.decrypt(encrypted_bytes)

            # Parse the payload
            payload = json.loads(decrypted_bytes.decode())

            # Extract original data
            data_str = payload["data"]

            # Try to parse as JSON first (for dict/list data)
            try:
                return json.loads(data_str)
            except json.JSONDecodeError:
                return data_str

        except Exception as e:
            # Log decryption failure but don't expose details
            current_app.logger.error(f"Decryption failed: {type(e).__name__}")
            return None

    def encrypt_pii(self, pii_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Encrypt personally identifiable information

        Args:
            pii_data: Dictionary of PII fields

        Returns:
            Dictionary with encrypted PII fields
        """
        encrypted_pii = {}

        for field, value in pii_data.items():
            if value is not None:
                encrypted_pii[field] = self.encrypt_field(value, "pii")

        return encrypted_pii

    def decrypt_pii(self, encrypted_pii: Dict[str, str]) -> Dict[str, Any]:
        """
        Decrypt personally identifiable information

        Args:
            encrypted_pii: Dictionary of encrypted PII fields

        Returns:
            Dictionary with decrypted PII fields
        """
        decrypted_pii = {}

        for field, encrypted_value in encrypted_pii.items():
            decrypted_pii[field] = self.decrypt_field(encrypted_value)

        return decrypted_pii

    def encrypt_financial_data(self, financial_data: Dict[str, Any]) -> Dict[str, str]:
        """
        Encrypt financial data with enhanced security

        Args:
            financial_data: Dictionary of financial fields

        Returns:
            Dictionary with encrypted financial fields
        """
        encrypted_data = {}

        for field, value in financial_data.items():
            if value is not None:
                encrypted_data[field] = self.encrypt_field(value, "financial")

        return encrypted_data

    def decrypt_financial_data(self, encrypted_data: Dict[str, str]) -> Dict[str, Any]:
        """
        Decrypt financial data

        Args:
            encrypted_data: Dictionary of encrypted financial fields

        Returns:
            Dictionary with decrypted financial fields
        """
        decrypted_data = {}

        for field, encrypted_value in encrypted_data.items():
            decrypted_data[field] = self.decrypt_field(encrypted_value)

        return decrypted_data

    def hash_sensitive_identifier(self, identifier: str, salt: str = None) -> str:
        """
        Create a one-way hash of sensitive identifiers for indexing

        Args:
            identifier: Sensitive identifier to hash
            salt: Optional salt (uses default if not provided)

        Returns:
            Hex-encoded hash
        """
        if salt is None:
            salt = (
                "blockguardian_default_salt"  # In production, use a secure random salt
            )

        # Combine identifier and salt
        data = f"{identifier}{salt}".encode()

        # Create SHA-256 hash
        hash_obj = hashlib.sha256(data)

        return hash_obj.hexdigest()

    def generate_api_key(self, user_id: int, permissions: list = None) -> str:
        """
        Generate encrypted API key for external integrations

        Args:
            user_id: User ID
            permissions: List of permissions for the API key

        Returns:
            Encrypted API key
        """
        api_key_data = {
            "user_id": user_id,
            "permissions": permissions or [],
            "created_at": datetime.utcnow().isoformat(),
            "key_type": "api",
        }

        return self.encrypt_field(api_key_data, "api_key")

    def verify_api_key(self, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Verify and decode API key

        Args:
            api_key: Encrypted API key

        Returns:
            Decoded API key data or None if invalid
        """
        try:
            return self.decrypt_field(api_key)
        except Exception:
            return None

    def encrypt_blockchain_private_key(
        self, private_key: str, user_password: str
    ) -> str:
        """
        Encrypt blockchain private key with user password

        Args:
            private_key: Blockchain private key
            user_password: User's password for additional encryption

        Returns:
            Encrypted private key
        """
        # Derive key from user password
        salt = os.urandom(16)
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        password_key = base64.urlsafe_b64encode(kdf.derive(user_password.encode()))

        # Encrypt with password-derived key
        password_fernet = Fernet(password_key)
        encrypted_key = password_fernet.encrypt(private_key.encode())

        # Combine salt and encrypted key
        combined = salt + encrypted_key

        # Encrypt again with system key
        return self.encrypt_field(base64.b64encode(combined).decode(), "blockchain_key")

    def decrypt_blockchain_private_key(
        self, encrypted_key: str, user_password: str
    ) -> Optional[str]:
        """
        Decrypt blockchain private key with user password

        Args:
            encrypted_key: Encrypted private key
            user_password: User's password

        Returns:
            Decrypted private key or None if invalid
        """
        try:
            # Decrypt with system key
            combined_data = self.decrypt_field(encrypted_key)
            if not combined_data:
                return None

            combined_bytes = base64.b64decode(combined_data)

            # Extract salt and encrypted key
            salt = combined_bytes[:16]
            encrypted_private_key = combined_bytes[16:]

            # Derive key from user password
            kdf = PBKDF2HMAC(
                algorithm=hashes.SHA256(),
                length=32,
                salt=salt,
                iterations=100000,
            )
            password_key = base64.urlsafe_b64encode(kdf.derive(user_password.encode()))

            # Decrypt with password-derived key
            password_fernet = Fernet(password_key)
            private_key = password_fernet.decrypt(encrypted_private_key)

            return private_key.decode()

        except Exception as e:
            current_app.logger.error(
                f"Failed to decrypt blockchain private key: {type(e).__name__}"
            )
            return None

    def rotate_encryption_key(self, new_key: bytes = None) -> bool:
        """
        Rotate encryption keys (for scheduled key rotation)

        Args:
            new_key: New encryption key (generates one if not provided)

        Returns:
            True if rotation successful
        """
        try:
            if new_key is None:
                new_key = Fernet.generate_key()

            # Add new key to the front of the rotation list
            new_fernet = Fernet(new_key)
            current_keys = list(self.multi_fernet._fernets)
            current_keys.insert(0, new_fernet)

            # Keep only the last 3 keys for backward compatibility
            if len(current_keys) > 3:
                current_keys = current_keys[:3]

            self.multi_fernet = MultiFernet(current_keys)

            # Update primary key
            self.primary_key = new_key
            self.fernet = new_fernet

            return True

        except Exception as e:
            current_app.logger.error(f"Key rotation failed: {e}")
            return False


# Global encryption manager instance
encryption_manager = EncryptionManager()
