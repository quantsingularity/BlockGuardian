"""
Enhanced user model with enterprise security and compliance features
Implements KYC/AML compliance, MFA, and comprehensive audit trails
"""

import enum
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Any, Dict

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from ..security.auth import auth_manager
from .base import BaseModel


class UserStatus(enum.Enum):
    """User account status"""

    PENDING = "pending"
    ACTIVE = "active"
    SUSPENDED = "suspended"
    LOCKED = "locked"
    DEACTIVATED = "deactivated"


class UserTier(enum.Enum):
    """User subscription tiers"""

    BASIC = "basic"
    PREMIUM = "premium"
    PROFESSIONAL = "professional"
    ENTERPRISE = "enterprise"


class KYCStatus(enum.Enum):
    """KYC verification status"""

    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    EXPIRED = "expired"


class AMLRiskLevel(enum.Enum):
    """AML risk assessment levels"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    PROHIBITED = "prohibited"


# Initialize SQLAlchemy
# db = SQLAlchemy() # Removed unused local SQLAlchemy instance, assuming base.py handles it


class User(BaseModel):
    """Enhanced user model with security and compliance features"""

    __tablename__ = "users"

    # Primary identification
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Basic user information
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    middle_name = Column(String(100))
    hashed_password = Column(String(255), nullable=False)

    # Account status and permissions
    status = Column(
        String(20), default=UserStatus.PENDING.value, nullable=False, index=True
    )
    role = Column(String(20), default="user", nullable=False, index=True)
    tier = Column(String(20), default=UserTier.BASIC.value, nullable=False)

    # Contact information (encrypted in metadata)
    phone = Column(String(20))
    email_verified = Column(Boolean, default=False)
    phone_verified = Column(Boolean, default=False)

    # Address information
    address_line1 = Column(String(200))
    address_line2 = Column(String(200))
    city = Column(String(100))
    state = Column(String(50))
    country = Column(String(50), index=True)
    postal_code = Column(String(20))

    # Personal information
    date_of_birth = Column(DateTime)
    ssn_last_four = Column(String(4))  # Only store last 4 digits
    nationality = Column(String(50))
    occupation = Column(String(100))
    employer = Column(String(200))
    annual_income = Column(Numeric(15, 2))
    net_worth = Column(Numeric(15, 2))

    # Investment profile
    investment_experience = Column(
        String(20)
    )  # beginner, intermediate, advanced, expert
    risk_tolerance = Column(String(20))  # conservative, moderate, aggressive
    investment_objectives = Column(Text)  # JSON array of objectives
    time_horizon = Column(String(20))  # short, medium, long
    liquidity_needs = Column(String(20))  # low, medium, high

    # Security settings
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(Text)  # Encrypted TOTP secret
    backup_codes = Column(Text)  # Encrypted JSON array of backup codes
    security_questions = Column(Text)  # Encrypted JSON

    # Login tracking
    last_login = Column(DateTime(timezone=True))
    login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime(timezone=True))
    password_changed_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    last_password_reset = Column(DateTime(timezone=True))

    # Session management
    active_sessions = Column(Integer, default=0)
    max_sessions = Column(Integer, default=3)
    session_timeout = Column(Integer, default=3600)  # seconds

    # KYC/AML compliance
    kyc_status = Column(
        String(20), default=KYCStatus.NOT_STARTED.value, nullable=False, index=True
    )
    kyc_submitted_at = Column(DateTime(timezone=True))
    kyc_approved_at = Column(DateTime(timezone=True))
    kyc_expires_at = Column(DateTime(timezone=True))
    kyc_tier = Column(String(20))  # basic, enhanced, premium
    kyc_documents = Column(JSONB)  # Document references and metadata

    aml_risk_level = Column(
        String(20), default=AMLRiskLevel.LOW.value, nullable=False, index=True
    )
    aml_last_check = Column(DateTime(timezone=True))
    aml_score = Column(Integer, default=0)  # 0-100 risk score
    aml_notes = Column(Text)
    pep_status = Column(Boolean, default=False)  # Politically Exposed Person
    sanctions_check = Column(Boolean, default=False)

    # Financial limits and restrictions
    daily_transaction_limit = Column(Numeric(15, 2), default=Decimal("10000.00"))
    monthly_transaction_limit = Column(Numeric(15, 2), default=Decimal("100000.00"))
    annual_transaction_limit = Column(Numeric(15, 2), default=Decimal("1000000.00"))
    total_transaction_volume = Column(Numeric(15, 2), default=Decimal("0.00"))

    # Trading permissions
    options_approved = Column(Boolean, default=False)
    margin_approved = Column(Boolean, default=False)
    crypto_approved = Column(Boolean, default=False)
    international_approved = Column(Boolean, default=False)

    # API access
    api_key_hash = Column(String(255))  # Hashed API key
    api_rate_limit = Column(Integer, default=1000)  # Requests per hour
    api_last_used = Column(DateTime(timezone=True))

    # Notification preferences
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    push_notifications = Column(Boolean, default=True)
    marketing_emails = Column(Boolean, default=False)

    # Privacy and consent
    privacy_policy_accepted = Column(Boolean, default=False)
    terms_accepted = Column(Boolean, default=False)
    data_processing_consent = Column(Boolean, default=False)
    marketing_consent = Column(Boolean, default=False)

    # Additional metadata
    metadata = Column(JSONB)  # Flexible storage for additional data
    tags = Column(String(500))  # Comma-separated tags
    notes = Column(Text)  # Internal notes

    # Relationships
    portfolios = relationship(
        "Portfolio", back_populates="user", cascade="all, delete-orphan"
    )
    transactions = relationship(
        "Transaction", back_populates="user", cascade="all, delete-orphan"
    )

    # Indexes for performance
    __table_args__ = (
        Index("idx_user_email_status", "email", "status"),
        Index("idx_user_kyc_aml", "kyc_status", "aml_risk_level"),
        Index("idx_user_country_tier", "country", "tier"),
        Index("idx_user_created_status", "created_at", "status"),
    )

    def __init__(self, **kwargs):
        """Initialize user with enhanced security features"""
        super().__init__(**kwargs)

        # Set default values
        if not self.id:
            self.id = uuid.uuid4()

    def set_password(self, password: str):
        """Set user password with security tracking"""
        self.hashed_password = auth_manager.hash_password(password)
        self.password_changed_at = datetime.now(timezone.utc)
        self.login_attempts = 0  # Reset login attempts on password change

        # Update metadata
        if not self.metadata:
            self.metadata = {}

        if "password_history" not in self.metadata:
            self.metadata["password_history"] = []

        # Store password change timestamp (not the password itself)
        self.metadata["password_history"].append(
            {
                "changed_at": datetime.now(timezone.utc).isoformat(),
                "ip_address": None,  # Should be set by calling code
                "user_agent": None,  # Should be set by calling code
            }
        )

        # Keep only last 5 password changes
        if len(self.metadata["password_history"]) > 5:
            self.metadata["password_history"] = self.metadata["password_history"][-5:]

    def verify_password(self, password: str) -> bool:
        """Verify user password"""
        return auth_manager.verify_password(password, self.hashed_password)

    def is_locked(self) -> bool:
        """Check if user account is locked"""
        if self.locked_until and self.locked_until > datetime.now(timezone.utc):
            return True
        return self.status == UserStatus.LOCKED.value

    def is_active(self) -> bool:
        """Check if user account is active"""
        return self.status == UserStatus.ACTIVE.value and not self.is_locked()

    def can_trade(self) -> bool:
        """Check if user can perform trading operations"""
        return (
            self.is_active()
            and self.kyc_status == KYCStatus.APPROVED.value
            and self.aml_risk_level != AMLRiskLevel.PROHIBITED.value
        )

    def can_trade_asset_type(self, asset_type: str) -> bool:
        """Check if user can trade specific asset type"""
        if not self.can_trade():
            return False

        asset_permissions = {
            "options": self.options_approved,
            "crypto": self.crypto_approved,
            "international": self.international_approved,
            "margin": self.margin_approved,
        }

        return asset_permissions.get(asset_type, True)

    def get_transaction_limit(self, period: str = "daily") -> Decimal:
        """Get transaction limit for specified period"""
        limits = {
            "daily": self.daily_transaction_limit,
            "monthly": self.monthly_transaction_limit,
            "annual": self.annual_transaction_limit,
        }
        # Idiomatic Python: Use f-string for error message
        if period not in limits:
            raise ValueError(
                f"Invalid period '{period}'. Must be one of: {', '.join(limits.keys())}"
            )
        return limits[period]

    def update_kyc_status(self, new_status: str, notes: str = None):
        """Update KYC status with audit trail"""
        old_status = self.kyc_status
        self.kyc_status = new_status

        if new_status == KYCStatus.APPROVED.value:
            self.kyc_approved_at = datetime.now(timezone.utc)
            # Set expiration (typically 1 year)
            self.kyc_expires_at = datetime.now(timezone.utc) + timedelta(days=365)

        # Update metadata
        if not self.metadata:
            self.metadata = {}

        if "kyc_history" not in self.metadata:
            self.metadata["kyc_history"] = []

        self.metadata["kyc_history"].append(
            {
                "from_status": old_status,
                "to_status": new_status,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "notes": notes,
            }
        )

    def update_aml_risk(self, risk_level: str, score: int, notes: str = None):
        """Update AML risk assessment"""
        self.aml_risk_level = risk_level
        self.aml_score = score
        self.aml_last_check = datetime.now(timezone.utc)

        if notes:
            self.aml_notes = notes

        # Update metadata
        if not self.metadata:
            self.metadata = {}

        if "aml_history" not in self.metadata:
            self.metadata["aml_history"] = []

        self.metadata["aml_history"].append(
            {
                "risk_level": risk_level,
                "score": score,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "notes": notes,
            }
        )

    def record_login_attempt(
        self, success: bool, ip_address: str = None, user_agent: str = None
    ):
        """Record login attempt with security tracking"""
        if success:
            self.last_login = datetime.now(timezone.utc)
            self.login_attempts = 0
            self.locked_until = None
        else:
            self.login_attempts += 1

            # Lock account after 5 failed attempts
            if self.login_attempts >= 5:
                self.locked_until = datetime.now(timezone.utc) + timedelta(minutes=30)

        # Update metadata
        if not self.metadata:
            self.metadata = {}

        if "login_history" not in self.metadata:
            self.metadata["login_history"] = []

        self.metadata["login_history"].append(
            {
                "success": success,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "ip_address": ip_address,
                "user_agent": user_agent,
                "attempts_count": self.login_attempts,
            }
        )

        # Keep only last 10 login attempts
        if len(self.metadata["login_history"]) > 10:
            self.metadata["login_history"] = self.metadata["login_history"][-10:]

    def get_full_name(self) -> str:
        """Get user's full name"""
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        parts.append(self.last_name)
        return " ".join(parts)

    def get_risk_profile(self) -> Dict[str, Any]:
        """Get comprehensive risk profile"""
        return {
            "investment_experience": self.investment_experience,
            "risk_tolerance": self.risk_tolerance,
            "time_horizon": self.time_horizon,
            "liquidity_needs": self.liquidity_needs,
            "annual_income": float(self.annual_income) if self.annual_income else None,
            "net_worth": float(self.net_worth) if self.net_worth else None,
            "aml_risk_level": self.aml_risk_level,
            "aml_score": self.aml_score,
            "kyc_status": self.kyc_status,
        }

    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert user to dictionary with privacy controls"""
        result = {
            "id": str(self.id),
            "email": self.email,
            "username": self.username,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "middle_name": self.middle_name,
            "status": self.status,
            "role": self.role,
            "tier": self.tier,
            "email_verified": self.email_verified,
            "phone_verified": self.phone_verified,
            "country": self.country,
            "kyc_status": self.kyc_status,
            "aml_risk_level": self.aml_risk_level,
            "mfa_enabled": self.mfa_enabled,
            "last_login": self.last_login.isoformat() if self.last_login else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

        # Always exclude sensitive fields
        sensitive_fields = [
            "hashed_password",
            "mfa_secret",
            "backup_codes",
            "security_questions",
            "api_key_hash",
            "ssn_last_four",
            "metadata",
        ]

        # Include additional fields if authorized
        if include_sensitive:
            additional_fields = [
                "phone",
                "address_line1",
                "address_line2",
                "city",
                "state",
                "postal_code",
                "date_of_birth",
                "nationality",
                "occupation",
                "employer",
                "annual_income",
                "net_worth",
                "investment_experience",
                "risk_tolerance",
                "investment_objectives",
                "time_horizon",
                "liquidity_needs",
                "daily_transaction_limit",
                "monthly_transaction_limit",
                "annual_transaction_limit",
                "options_approved",
                "margin_approved",
                "crypto_approved",
                "international_approved",
                "notes",
            ]

            for field in additional_fields:
                value = getattr(self, field, None)
                if isinstance(value, Decimal):
                    value = float(value)
                elif isinstance(value, datetime):
                    value = value.isoformat()
                result[field] = value

        return result


class UserSession(BaseModel):
    """User session tracking for security and compliance"""

    __tablename__ = "user_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True
    )
    session_token = Column(String(255), unique=True, nullable=False, index=True)

    # Session details
    ip_address = Column(String(45))
    user_agent = Column(String(500))
    device_fingerprint = Column(String(255))
    location = Column(String(200))

    # Session lifecycle
    expires_at = Column(DateTime(timezone=True), nullable=False)
    last_activity = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    is_active = Column(Boolean, default=True)

    # Security flags
    is_suspicious = Column(Boolean, default=False)
    risk_score = Column(Integer, default=0)

    # Relationships
    user = relationship("User")

    def is_expired(self) -> bool:
        """Check if session is expired"""
        return datetime.now(timezone.utc) > self.expires_at

    def extend_session(self, duration: timedelta = None):
        """Extend session expiration"""
        if duration is None:
            duration = timedelta(hours=8)  # Default 8 hours

        self.expires_at = datetime.now(timezone.utc) + duration
        self.last_activity = datetime.now(timezone.utc)

    def to_dict(self) -> Dict[str, Any]:
        """Convert session to dictionary"""
        return {
            "id": str(self.id),
            "user_id": str(self.user_id),
            "ip_address": self.ip_address,
            "location": self.location,
            "expires_at": self.expires_at.isoformat(),
            "last_activity": self.last_activity.isoformat(),
            "is_active": self.is_active,
            "is_suspicious": self.is_suspicious,
            "risk_score": self.risk_score,
            "created_at": self.created_at.isoformat(),
        }
