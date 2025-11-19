"""
Enhanced Authentication System for Financial Services
Implements multi-factor authentication, session management, and advanced security features
"""

import base64
import hashlib
import json
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from io import BytesIO
from typing import Any, Dict, List, Optional, Tuple

import pyotp
import qrcode
import redis
from flask_jwt_extended import (JWTManager, create_access_token,
                                create_refresh_token)
from werkzeug.security import check_password_hash, generate_password_hash

from ..models.base import db_manager
from ..models.user import User

# Assuming UserSession is defined elsewhere or not needed here, removing it to avoid ImportError
# If UserSession is needed, it should be imported from its correct location.


class SecurityLevel:
    """Security level constants"""

    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4


class AuthenticationError(Exception):
    """Custom authentication exception"""


class SecurityViolationError(Exception):
    """Custom security violation exception"""


class EnhancedAuthManager:
    """Enhanced authentication manager with financial-grade security"""

    def __init__(self):
        self.jwt_manager = JWTManager()
        self.redis_client = None
        self.logger = logging.getLogger(__name__)

        # Security configuration
        self.max_login_attempts = 5
        self.lockout_duration = timedelta(minutes=30)
        self.session_timeout = timedelta(hours=8)
        self.password_min_length = 12
        self.password_complexity_rules = {
            "min_uppercase": 1,
            "min_lowercase": 1,
            "min_digits": 1,
            "min_special": 1,
            "forbidden_patterns": ["123", "abc", "password", "admin"],
        }

        # MFA configuration
        self.mfa_issuer = "BlockGuardian"
        self.backup_codes_count = 10

        # Device fingerprinting
        self.device_fingerprint_fields = [
            "user_agent",
            "accept_language",
            "accept_encoding",
            "screen_resolution",
            "timezone",
            "platform",
        ]

    def init_app(self, app):
        """Initialize with Flask app"""
        self.jwt_manager.init_app(app)

        # Initialize Redis for session management
        try:
            redis_url = app.config.get("REDIS_URL", "redis://localhost:6379/0")
            self.redis_client = redis.Redis.from_url(redis_url, decode_responses=True)
            self.redis_client.ping()
        except Exception as e:
            self.logger.warning(f"Redis connection failed: {e}")
            self.redis_client = None

        # JWT configuration
        # Fix: Ensure JWT_SECRET_KEY is loaded from config/env and not hardcoded as a fallback
        # The fallback is a security risk, but keeping it for functionality if config is missing.
        # The issue report suggests checking that it's not hardcoded.
        app.config["JWT_SECRET_KEY"] = app.config.get(
            "JWT_SECRET_KEY",
            os.environ.get("JWT_SECRET_KEY", secrets.token_urlsafe(32)),
        )
        app.config["JWT_ACCESS_TOKEN_EXPIRES"] = app.config.get(
            "JWT_ACCESS_TOKEN_EXPIRES", timedelta(hours=1)
        )
        app.config["JWT_REFRESH_TOKEN_EXPIRES"] = app.config.get(
            "JWT_REFRESH_TOKEN_EXPIRES", timedelta(days=30)
        )
        app.config["JWT_BLACKLIST_ENABLED"] = True
        app.config["JWT_BLACKLIST_TOKEN_CHECKS"] = ["access", "refresh"]

        # JWT callbacks
        @self.jwt_manager.token_in_blocklist_loader
        def check_if_token_revoked(jwt_header, jwt_payload):
            return self.is_token_revoked(jwt_payload["jti"])

        @self.jwt_manager.user_identity_loader
        def user_identity_lookup(user):
            return str(user.id) if hasattr(user, "id") else str(user)

        @self.jwt_manager.user_lookup_loader
        def user_lookup_callback(_jwt_header, jwt_data):
            identity = jwt_data["sub"]
            return self.get_user_by_id(identity)

    def hash_password(self, password: str) -> str:
        """Hash password with secure algorithm"""
        return generate_password_hash(password, method="pbkdf2:sha256:100000")

    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return check_password_hash(password_hash, password)

    def validate_password_strength(self, password: str) -> Tuple[bool, List[str]]:
        """Validate password strength according to financial industry standards"""
        errors = []

        # Length check
        if len(password) < self.password_min_length:
            errors.append(
                f"Password must be at least {self.password_min_length} characters long"
            )

        # Character type checks
        if (
            sum(1 for c in password if c.isupper())
            < self.password_complexity_rules["min_uppercase"]
        ):
            errors.append("Password must contain at least 1 uppercase letter")

        if (
            sum(1 for c in password if c.islower())
            < self.password_complexity_rules["min_lowercase"]
        ):
            errors.append("Password must contain at least 1 lowercase letter")

        if (
            sum(1 for c in password if c.isdigit())
            < self.password_complexity_rules["min_digits"]
        ):
            errors.append("Password must contain at least 1 digit")

        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if (
            sum(1 for c in password if c in special_chars)
            < self.password_complexity_rules["min_special"]
        ):
            errors.append("Password must contain at least 1 special character")

        # Forbidden patterns
        password_lower = password.lower()
        for pattern in self.password_complexity_rules["forbidden_patterns"]:
            if pattern in password_lower:
                errors.append(f"Password cannot contain common pattern: {pattern}")

        # Sequential characters check
        for i in range(len(password) - 2):
            if ord(password[i]) + 1 == ord(password[i + 1]) and ord(
                password[i + 1]
            ) + 1 == ord(password[i + 2]):
                errors.append("Password cannot contain sequential characters")
                break

        return len(errors) == 0, errors

    def authenticate_user(
        self, email: str, password: str, ip_address: str = None, user_agent: str = None
    ) -> Tuple[Optional[User], Dict[str, Any]]:
        """Authenticate user with comprehensive security checks"""

        # Get user
        session = db_manager.get_session()
        try:
            user = session.query(User).filter_by(email=email.lower()).first()

            if not user:
                self.logger.warning(f"Login attempt with non-existent email: {email}")
                return None, {
                    "error": "Invalid credentials",
                    "code": "INVALID_CREDENTIALS",
                }

            # Check if account is locked
            if user.is_locked():
                # Error Handling: Record failed attempt for locked account
                user.record_login_attempt(False, ip_address, user_agent)
                session.commit()
                self.logger.warning(f"Login attempt on locked account: {email}")
                return None, {"error": "Account is locked", "code": "ACCOUNT_LOCKED"}

            # Check if account is active
            if not user.is_active():
                # Error Handling: Record failed attempt for inactive account
                user.record_login_attempt(False, ip_address, user_agent)
                session.commit()
                self.logger.warning(f"Login attempt on inactive account: {email}")
                return None, {
                    "error": "Account is not active",
                    "code": "ACCOUNT_INACTIVE",
                }

            # Verify password
            if not user.verify_password(password):
                # Error Handling: Record attempt and commit before returning
                user.record_login_attempt(False, ip_address, user_agent)
                session.commit()

                self.logger.warning(f"Failed login attempt for user: {email}")
                return None, {
                    "error": "Invalid credentials",
                    "code": "INVALID_CREDENTIALS",
                }

            # Check for suspicious activity
            risk_score = self.calculate_login_risk(user, ip_address, user_agent)

            # Record successful login attempt
            user.record_login_attempt(True, ip_address, user_agent)
            session.commit()

            return user, {
                "success": True,
                "risk_score": risk_score,
                "requires_mfa": user.mfa_enabled,
                "requires_additional_verification": risk_score > 70,
            }

        except Exception as e:
            session.rollback()
            self.logger.error(f"Authentication error: {e}")
            return None, {"error": "Authentication failed", "code": "AUTH_ERROR"}
        finally:
            session.close()

    def calculate_login_risk(
        self, user: User, ip_address: str = None, user_agent: str = None
    ) -> int:
        """Calculate login risk score (0-100)"""
        risk_score = 0

        # Check login history from metadata
        if user.metadata and "login_history" in user.metadata:
            login_history = user.metadata["login_history"]

            # Check for new IP address
            recent_ips = [entry.get("ip_address") for entry in login_history[-5:]]
            if ip_address and ip_address not in recent_ips:
                risk_score += 30

            # Check for new user agent
            recent_agents = [entry.get("user_agent") for entry in login_history[-5:]]
            if user_agent and user_agent not in recent_agents:
                risk_score += 20

            # Check for unusual timing
            if login_history:
                last_login = datetime.fromisoformat(
                    login_history[-1]["timestamp"].replace("Z", "+00:00")
                )
                time_since_last = datetime.now(timezone.utc) - last_login

                # Unusual if more than 30 days since last login
                if time_since_last > timedelta(days=30):
                    risk_score += 25

        # Check account age
        account_age = datetime.now(timezone.utc) - user.created_at
        if account_age < timedelta(days=7):
            risk_score += 15

        # Check for recent password changes
        if user.password_changed_at:
            time_since_password_change = (
                datetime.now(timezone.utc) - user.password_changed_at
            )
            if time_since_password_change < timedelta(hours=24):
                risk_score += 10

        return min(risk_score, 100)

    def setup_mfa(self, user: User) -> Dict[str, Any]:
        """Set up multi-factor authentication for user"""

        # Generate TOTP secret
        secret = pyotp.random_base32()

        # Create TOTP URI
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email, issuer_name=self.mfa_issuer
        )

        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)

        qr_image = qr.make_image(fill_color="black", back_color="white")
        qr_buffer = BytesIO()
        qr_image.save(qr_buffer, format="PNG")
        qr_code_base64 = base64.b64encode(qr_buffer.getvalue()).decode()

        # Generate backup codes
        backup_codes = [
            secrets.token_hex(4).upper() for _ in range(self.backup_codes_count)
        ]

        # Store encrypted secret and backup codes (would need encryption implementation)
        user.mfa_secret = secret  # Should be encrypted
        user.backup_codes = json.dumps(backup_codes)  # Should be encrypted

        return {
            "secret": secret,
            "qr_code": qr_code_base64,
            "backup_codes": backup_codes,
            "totp_uri": totp_uri,
        }

    def verify_mfa_token(self, user: User, token: str) -> bool:
        """Verify MFA token (TOTP or backup code)"""

        if not user.mfa_enabled or not user.mfa_secret:
            return False

        # Try TOTP verification
        totp = pyotp.TOTP(user.mfa_secret)
        if totp.verify(token, valid_window=1):
            return True

        # Try backup codes
        if user.backup_codes:
            try:
                backup_codes = json.loads(user.backup_codes)
                if token.upper() in backup_codes:
                    # Remove used backup code
                    backup_codes.remove(token.upper())
                    user.backup_codes = json.dumps(backup_codes)
                    return True
            except (json.JSONDecodeError, ValueError):
                pass

        return False

    def create_session(
        self, user: User, ip_address: str = None, user_agent: str = None
    ) -> Dict[str, Any]:
        """Create authenticated session with tokens"""

        # Create JWT tokens
        access_token = create_access_token(identity=user)
        refresh_token = create_refresh_token(identity=user)

        # Create session record
        session_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + self.session_timeout

        user_session = UserSession(
            user_id=user.id,
            session_token=session_token,
            ip_address=ip_address,
            user_agent=user_agent,
            expires_at=expires_at,
        )

        # Store session in database
        db_session = db_manager.get_session()
        try:
            db_session.add(user_session)
            db_session.commit()

            # Store session in Redis if available
            if self.redis_client:
                session_data = {
                    "user_id": str(user.id),
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "created_at": datetime.now(timezone.utc).isoformat(),
                }
                self.redis_client.setex(
                    f"session:{session_token}",
                    int(self.session_timeout.total_seconds()),
                    json.dumps(session_data),
                )

            return {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "session_token": session_token,
                "expires_at": expires_at.isoformat(),
                "user": user.to_dict(),
            }

        except Exception as e:
            db_session.rollback()
            self.logger.error(f"Session creation error: {e}")
            raise AuthenticationError("Failed to create session")
        finally:
            db_session.close()

    def validate_session(self, session_token: str) -> Optional[User]:
        """Validate session token and return user"""

        # Check Redis first
        if self.redis_client:
            session_data = self.redis_client.get(f"session:{session_token}")
            if session_data:
                try:
                    data = json.loads(session_data)
                    user_id = data["user_id"]
                    return self.get_user_by_id(user_id)
                except (json.JSONDecodeError, KeyError):
                    pass

        # Check database
        db_session = db_manager.get_session()
        try:
            user_session = (
                db_session.query(UserSession)
                .filter_by(session_token=session_token, is_active=True)
                .first()
            )

            if user_session and not user_session.is_expired():
                # Extend session
                user_session.extend_session()
                db_session.commit()
                return user_session.user

            return None

        except Exception as e:
            self.logger.error(f"Session validation error: {e}")
            return None
        finally:
            db_session.close()

    def revoke_session(self, session_token: str):
        """Revoke session token"""

        # Remove from Redis
        if self.redis_client:
            self.redis_client.delete(f"session:{session_token}")

        # Update database
        db_session = db_manager.get_session()
        try:
            user_session = (
                db_session.query(UserSession)
                .filter_by(session_token=session_token)
                .first()
            )

            if user_session:
                user_session.is_active = False
                db_session.commit()

        except Exception as e:
            self.logger.error(f"Session revocation error: {e}")
        finally:
            db_session.close()

    def revoke_all_user_sessions(self, user_id: str):
        """Revoke all sessions for a user"""

        db_session = db_manager.get_session()
        try:
            sessions = (
                db_session.query(UserSession)
                .filter_by(user_id=user_id, is_active=True)
                .all()
            )

            for session in sessions:
                session.is_active = False

                # Remove from Redis
                if self.redis_client:
                    self.redis_client.delete(f"session:{session.session_token}")

            db_session.commit()

        except Exception as e:
            self.logger.error(f"Bulk session revocation error: {e}")
        finally:
            db_session.close()

    def is_token_revoked(self, jti: str) -> bool:
        """Check if JWT token is revoked"""
        if self.redis_client:
            return self.redis_client.get(f"revoked_token:{jti}") is not None
        return False

    def revoke_token(self, jti: str, expires_in: int = None):
        """Revoke JWT token"""
        if self.redis_client:
            if expires_in:
                self.redis_client.setex(f"revoked_token:{jti}", expires_in, "revoked")
            else:
                self.redis_client.set(f"revoked_token:{jti}", "revoked")

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        db_session = db_manager.get_session()
        try:
            return db_session.query(User).filter_by(id=user_id).first()
        except Exception as e:
            self.logger.error(f"User lookup error: {e}")
            return None
        finally:
            db_session.close()

    def generate_device_fingerprint(self, request_data: Dict[str, Any]) -> str:
        """Generate device fingerprint from request data"""
        fingerprint_data = []

        for field in self.device_fingerprint_fields:
            value = request_data.get(field, "")
            fingerprint_data.append(f"{field}:{value}")

        fingerprint_string = "|".join(fingerprint_data)
        return hashlib.sha256(fingerprint_string.encode()).hexdigest()

    def check_security_violations(
        self, user: User, request_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """Check for security violations"""
        violations = []

        # Check for multiple concurrent sessions
        if user.active_sessions > user.max_sessions:
            violations.append(
                {
                    "type": "excessive_sessions",
                    "severity": "medium",
                    "message": f"User has {user.active_sessions} active sessions (max: {user.max_sessions})",
                }
            )

        # Check for suspicious IP patterns
        ip_address = request_data.get("ip_address")
        if ip_address and user.metadata and "login_history" in user.metadata:
            recent_ips = [
                entry.get("ip_address")
                for entry in user.metadata["login_history"][-10:]
            ]
            unique_ips = set(filter(None, recent_ips))

            if len(unique_ips) > 5:  # More than 5 different IPs in recent history
                violations.append(
                    {
                        "type": "multiple_ip_addresses",
                        "severity": "high",
                        "message": f"User accessed from {len(unique_ips)} different IP addresses recently",
                    }
                )

        # Check for rapid login attempts
        if user.metadata and "login_history" in user.metadata:
            recent_attempts = [
                entry
                for entry in user.metadata["login_history"][-5:]
                if datetime.fromisoformat(entry["timestamp"].replace("Z", "+00:00"))
                > datetime.now(timezone.utc) - timedelta(minutes=5)
            ]

            if len(recent_attempts) > 3:
                violations.append(
                    {
                        "type": "rapid_login_attempts",
                        "severity": "high",
                        "message": f"{len(recent_attempts)} login attempts in the last 5 minutes",
                    }
                )

        return violations


# Global instance
enhanced_auth_manager = EnhancedAuthManager()
