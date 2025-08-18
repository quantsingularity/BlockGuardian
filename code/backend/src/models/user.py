"""
Enhanced user model with enterprise security and compliance features
Implements KYC/AML compliance, MFA, and comprehensive audit trails
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Enum, Float, ForeignKey
from sqlalchemy.orm import relationship
from flask_sqlalchemy import SQLAlchemy
import enum
import json

from src.models.base import Base, AuditMixin, EncryptedMixin, TimestampMixin
from src.security.auth import UserRole, auth_manager
from src.security.encryption import encryption_manager


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
db = SQLAlchemy()


class User(Base, AuditMixin, EncryptedMixin, TimestampMixin):
    """Enhanced user model with security and compliance features"""
    
    __tablename__ = 'users'
    
    # Encrypted fields
    _encrypted_fields = ['ssn', 'phone', 'address', 'date_of_birth']
    
    # Basic user information
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Account status and permissions
    status = Column(Enum(UserStatus), default=UserStatus.PENDING, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    tier = Column(Enum(UserTier), default=UserTier.BASIC, nullable=False)
    
    # Contact information (encrypted)
    phone = Column(Text)  # Encrypted
    address = Column(Text)  # Encrypted
    city = Column(String(100))
    state = Column(String(50))
    country = Column(String(50))
    postal_code = Column(String(20))
    
    # Personal information (encrypted)
    date_of_birth = Column(Text)  # Encrypted
    ssn = Column(Text)  # Encrypted
    nationality = Column(String(50))
    
    # Security settings
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    mfa_secret = Column(Text)  # Encrypted TOTP secret
    backup_codes = Column(Text)  # Encrypted JSON array of backup codes
    
    # Login tracking
    last_login = Column(DateTime)
    login_attempts = Column(Integer, default=0, nullable=False)
    locked_until = Column(DateTime)
    password_changed_at = Column(DateTime, default=datetime.utcnow)
    
    # KYC/AML compliance
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.NOT_STARTED, nullable=False)
    kyc_submitted_at = Column(DateTime)
    kyc_approved_at = Column(DateTime)
    kyc_expires_at = Column(DateTime)
    kyc_documents = Column(Text)  # JSON array of document references
    
    aml_risk_level = Column(Enum(AMLRiskLevel), default=AMLRiskLevel.LOW, nullable=False)
    aml_last_check = Column(DateTime)
    aml_notes = Column(Text)
    
    # Financial limits and restrictions
    daily_transaction_limit = Column(Float, default=10000.0)
    monthly_transaction_limit = Column(Float, default=100000.0)
    total_transaction_volume = Column(Float, default=0.0)
    
    # API access
    api_key_hash = Column(String(255))  # Hashed API key
    api_rate_limit = Column(Integer, default=1000)  # Requests per hour
    
    def __repr__(self):
        return f'<User {self.username}>'
    
    def __init__(self, **kwargs):
        """Initialize user with encrypted fields"""
        # Handle encrypted fields
        encrypted_data = {}
        for field in self._encrypted_fields:
            if field in kwargs:
                encrypted_data[field] = kwargs.pop(field)
        
        # Initialize base model
        super().__init__(**kwargs)
        
        # Set encrypted fields
        for field, value in encrypted_data.items():
            self.set_encrypted_field(field, value, "pii")
    
    def set_password(self, password: str):
        """Set user password with security tracking"""
        self.hashed_password = auth_manager.hash_password(password)
        self.password_changed_at = datetime.utcnow()
        self.login_attempts = 0  # Reset login attempts on password change
        
        # Add audit entry
        self.add_audit_entry("password_changed")
    
    def verify_password(self, password: str) -> bool:
        """Verify user password"""
        return auth_manager.verify_password(password, self.hashed_password)
    
    def is_locked(self) -> bool:
        """Check if user account is locked"""
        if self.locked_until and self.locked_until > datetime.utcnow():
            return True
        return self.status == UserStatus.LOCKED
    
    def to_dict(self, include_sensitive: bool = False) -> Dict[str, Any]:
        """Convert user to dictionary with privacy controls"""
        result = super().to_dict(include_sensitive=include_sensitive)
        
        # Always exclude password hash
        result.pop('hashed_password', None)
        result.pop('mfa_secret', None)
        result.pop('backup_codes', None)
        result.pop('api_key_hash', None)
        
        # Include decrypted PII only if authorized
        if include_sensitive:
            for field in self._encrypted_fields:
                if hasattr(self, field) and getattr(self, field):
                    result[field] = self.get_encrypted_field(field)
        
        return result
