"""
User model for the BlockGuardian application.
Includes authentication, authorization, and compliance fields.
"""

import hashlib
import os
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Enum as SQLEnum, Integer, String

from .base import db_manager


class UserStatus(Enum):
    """User account status"""

    PENDING_VERIFICATION = "pending_verification"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    CLOSED = "closed"


class KYCStatus(Enum):
    """Know Your Customer (KYC) status"""

    NOT_STARTED = "not_started"
    PENDING_REVIEW = "pending_review"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class AMLRiskLevel(Enum):
    """Anti-Money Laundering (AML) risk level"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PROHIBITED = "prohibited"


class User(db_manager.Base):
    """User model"""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(128), nullable=False)
    salt = Column(String(32), nullable=False)

    # Personal Information
    first_name = Column(String(50))
    last_name = Column(String(50))
    date_of_birth = Column(DateTime)
    country = Column(String(50))
    address_line1 = Column(String(100))
    city = Column(String(50))
    postal_code = Column(String(20))
    phone_number = Column(String(20))

    # Compliance and Security
    status = Column(
        SQLEnum(UserStatus),
        default=UserStatus.PENDING_VERIFICATION,
        nullable=False,
        index=True,
    )
    kyc_status = Column(
        SQLEnum(KYCStatus), default=KYCStatus.NOT_STARTED, nullable=False, index=True
    )
    aml_risk_level = Column(
        SQLEnum(AMLRiskLevel), default=AMLRiskLevel.LOW, nullable=False, index=True
    )
    aml_score = Column(Integer, default=0)
    kyc_approved_at = Column(DateTime(timezone=True))
    kyc_expires_at = Column(DateTime(timezone=True))
    mfa_enabled = Column(Integer, default=0)  # 0: disabled, 1: enabled
    mfa_secret = Column(String(64))

    # Financial Profile
    annual_income = Column(
        String(50)
    )  # Stored as string for flexibility (e.g., ranges)
    risk_tolerance = Column(String(50))  # e.g., 'low', 'medium', 'high', 'aggressive'
    investment_experience = Column(
        String(50)
    )  # e.g., 'beginner', 'intermediate', 'expert'

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), default=datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=datetime.now(timezone.utc),
        onupdate=datetime.now(timezone.utc),
        nullable=False,
    )
    last_login_at = Column(DateTime(timezone=True))

    # Relationships (assuming other models exist)
    # transactions = relationship("Transaction", back_populates="user")
    # portfolios = relationship("Portfolio", back_populates="user")

    def __init__(self, username, email, password):
        self.username = username
        self.email = email
        self.set_password(password)

    def set_password(self, password: str):
        """Hashes the password and stores the hash and salt."""
        self.salt = os.urandom(16).hex()
        self.password_hash = self._hash_password(password, self.salt)

    def check_password(self, password: str) -> bool:
        """Checks if the provided password matches the stored hash."""
        return self.password_hash == self._hash_password(password, self.salt)

    def _hash_password(self, password: str, salt: str) -> str:
        """Internal method to hash a password using SHA-256."""
        # Use a strong, standard hashing algorithm like PBKDF2 in a real app.
        # For this example, we use a simple SHA-256 for demonstration.
        # DO NOT use this in production.
        hashed = hashlib.sha256((password + salt).encode("utf-8")).hexdigest()
        return hashed

    def is_active(self) -> bool:
        """Check if the user account is active."""
        return self.status == UserStatus.ACTIVE.value

    def is_kyc_approved(self) -> bool:
        """Check if the user has an approved and non-expired KYC status."""
        if self.kyc_status != KYCStatus.APPROVED.value:
            return False
        if self.kyc_expires_at and self.kyc_expires_at < datetime.now(timezone.utc):
            return False
        return True

    def get_full_name(self) -> str:
        """Returns the user's full name."""
        return f"{self.first_name or ''} {self.last_name or ''}".strip()

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', email='{self.email}', status='{self.status.value}')>"
