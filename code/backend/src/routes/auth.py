"""
Authentication API routes for BlockGuardian Backend
Implements secure authentication, registration, and session management
"""

import json
from datetime import datetime, timedelta
from typing import Any, Dict

from flask import Blueprint, g, jsonify, request
from src.models.base import db_manager
from src.models.user import User, UserStatus, db
from src.security.audit import audit_logger
from src.security.auth import AuditEventType, AuditSeverity, auth_manager, jwt_required
from src.security.rate_limiting import RateLimitScope, RateLimitType, rate_limit
from src.security.validation import ValidationError, security_validator

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@rate_limit(
    limit=5, window=300, scope=RateLimitScope.PER_IP
)  # 5 registrations per 5 minutes per IP
def register():
    """Register a new user account"""
    try:
        # Validate request size
        security_validator.validate_request_size()

        # Get and validate JSON data
        data = security_validator.validate_json_input(request.get_json())

        # Validate required fields
        required_fields = ["email", "username", "password", "first_name", "last_name"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Validate email
        email = security_validator.validate_email(data["email"])

        # Validate username
        username = security_validator.validate_username(data["username"])

        # Validate password
        security_validator.validate_password(data["password"])

        # Check for security threats
        threats = security_validator.check_security_threats(json.dumps(data))
        if threats:
            audit_logger.log_security_alert(
                "registration_security_threat",
                details={"threats": threats, "data": data},
            )
            return jsonify({"error": "Invalid input detected"}), 400

        # Check if user already exists
        session = db_manager.get_session()
        try:
            existing_user = (
                session.query(User)
                .filter((User.email == email) | (User.username == username))
                .first()
            )

            if existing_user:
                # Log failed registration attempt
                audit_logger.log_authentication_event(
                    AuditEventType.LOGIN_FAILURE,
                    success=False,
                    details={
                        "reason": "user_already_exists",
                        "email": email,
                        "username": username,
                    },
                )
                return jsonify({"error": "User already exists"}), 409

            # Create new user
            user = User(
                email=email,
                username=username,
                first_name=data["first_name"],
                last_name=data["last_name"],
                status=UserStatus.PENDING,
            )

            # Set password
            user.set_password(data["password"])

            # Add optional fields
            if "phone" in data:
                user.set_encrypted_field("phone", data["phone"], "pii")
            if "country" in data:
                user.country = data["country"]

            # Save user
            session.add(user)
            session.commit()

            # Log successful registration
            audit_logger.log_authentication_event(
                AuditEventType.LOGIN_SUCCESS,
                user_id=user.id,
                success=True,
                details={
                    "action": "registration",
                    "email": email,
                    "username": username,
                },
            )

            # Generate tokens
            tokens = auth_manager.generate_tokens(
                user.id, user.role.value, auth_manager.get_user_permissions(user.role)
            )

            return (
                jsonify(
                    {
                        "message": "User registered successfully",
                        "user": user.to_dict(),
                        "tokens": tokens,
                    }
                ),
                201,
            )

        finally:
            session.close()

    except ValidationError as e:
        return jsonify({"error": e.message, "field": e.field}), 400
    except Exception as e:
        audit_logger.log_security_alert("registration_error", details={"error": str(e)})
        return jsonify({"error": "Registration failed"}), 500


@auth_bp.route("/login", methods=["POST"])
@rate_limit(
    limit=10, window=300, scope=RateLimitScope.PER_IP
)  # 10 login attempts per 5 minutes per IP
def login():
    """Authenticate user and return tokens"""
    try:
        # Validate request size
        security_validator.validate_request_size()

        # Get and validate JSON data
        data = security_validator.validate_json_input(request.get_json())

        # Validate required fields
        if "email" not in data or "password" not in data:
            return jsonify({"error": "Email and password are required"}), 400

        # Validate email format
        email = security_validator.validate_email(data["email"])

        # Check for security threats
        threats = security_validator.check_security_threats(json.dumps(data))
        if threats:
            audit_logger.log_security_alert(
                "login_security_threat", details={"threats": threats, "email": email}
            )
            return jsonify({"error": "Invalid input detected"}), 400

        session = db_manager.get_session()
        try:
            # Find user
            user = session.query(User).filter(User.email == email).first()

            if not user:
                # Log failed login attempt
                audit_logger.log_authentication_event(
                    AuditEventType.LOGIN_FAILURE,
                    success=False,
                    details={"reason": "user_not_found", "email": email},
                )
                return jsonify({"error": "Invalid credentials"}), 401

            # Check if account is locked
            if user.is_locked():
                audit_logger.log_authentication_event(
                    AuditEventType.LOGIN_FAILURE,
                    user_id=user.id,
                    success=False,
                    details={
                        "reason": "account_locked",
                        "locked_until": (
                            user.locked_until.isoformat() if user.locked_until else None
                        ),
                    },
                )
                return jsonify({"error": "Account is locked"}), 423

            # Verify password
            if not user.verify_password(data["password"]):
                # Increment login attempts
                user.increment_login_attempts()
                session.commit()

                audit_logger.log_authentication_event(
                    AuditEventType.LOGIN_FAILURE,
                    user_id=user.id,
                    success=False,
                    details={
                        "reason": "invalid_password",
                        "login_attempts": user.login_attempts,
                    },
                )
                return jsonify({"error": "Invalid credentials"}), 401

            # Check MFA if enabled
            if user.mfa_enabled:
                mfa_token = data.get("mfa_token")
                if not mfa_token:
                    return (
                        jsonify({"error": "MFA token required", "mfa_required": True}),
                        200,
                    )

                if not user.verify_mfa_token(mfa_token):
                    audit_logger.log_authentication_event(
                        AuditEventType.LOGIN_FAILURE,
                        user_id=user.id,
                        success=False,
                        details={"reason": "invalid_mfa_token"},
                    )
                    return jsonify({"error": "Invalid MFA token"}), 401

            # Check account status
            if user.status != UserStatus.ACTIVE:
                audit_logger.log_authentication_event(
                    AuditEventType.LOGIN_FAILURE,
                    user_id=user.id,
                    success=False,
                    details={"reason": "account_inactive", "status": user.status.value},
                )
                return jsonify({"error": f"Account is {user.status.value}"}), 403

            # Successful login
            user.successful_login()
            session.commit()

            # Log successful login
            audit_logger.log_authentication_event(
                AuditEventType.LOGIN_SUCCESS,
                user_id=user.id,
                success=True,
                details={"email": email},
            )

            # Generate tokens
            tokens = auth_manager.generate_tokens(
                user.id, user.role.value, auth_manager.get_user_permissions(user.role)
            )

            return (
                jsonify(
                    {
                        "message": "Login successful",
                        "user": user.to_dict(),
                        "tokens": tokens,
                    }
                ),
                200,
            )

        finally:
            session.close()

    except ValidationError as e:
        return jsonify({"error": e.message, "field": e.field}), 400
    except Exception as e:
        audit_logger.log_security_alert("login_error", details={"error": str(e)})
        return jsonify({"error": "Login failed"}), 500


@auth_bp.route("/logout", methods=["POST"])
@jwt_required
def logout():
    """Logout user and revoke tokens"""
    try:
        # Get token from header
        auth_header = request.headers.get("Authorization")
        if auth_header:
            token = auth_header.split(" ")[1]

            # Revoke token
            auth_manager.revoke_token(token)

            # Log logout
            audit_logger.log_authentication_event(
                AuditEventType.LOGOUT, user_id=g.current_user_id, success=True
            )

            return jsonify({"message": "Logout successful"}), 200

        return jsonify({"error": "No token provided"}), 400

    except Exception as e:
        return jsonify({"error": "Logout failed"}), 500


@auth_bp.route("/refresh", methods=["POST"])
@rate_limit(limit=20, window=300, scope=RateLimitScope.PER_IP)
def refresh_token():
    """Refresh access token using refresh token"""
    try:
        data = request.get_json()
        if not data or "refresh_token" not in data:
            return jsonify({"error": "Refresh token is required"}), 400

        # Refresh tokens
        new_tokens = auth_manager.refresh_access_token(data["refresh_token"])

        if not new_tokens:
            return jsonify({"error": "Invalid refresh token"}), 401

        return (
            jsonify({"message": "Token refreshed successfully", "tokens": new_tokens}),
            200,
        )

    except Exception as e:
        return jsonify({"error": "Token refresh failed"}), 500


@auth_bp.route("/setup-mfa", methods=["POST"])
@jwt_required
def setup_mfa():
    """Set up multi-factor authentication"""
    try:
        session = db_manager.get_session()
        try:
            user = session.query(User).get(g.current_user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Generate MFA secret and QR code
            secret, qr_code, backup_codes = user.setup_mfa()
            session.commit()

            return (
                jsonify(
                    {
                        "message": "MFA setup initiated",
                        "secret": secret,
                        "qr_code": qr_code,
                        "backup_codes": backup_codes,
                    }
                ),
                200,
            )

        finally:
            session.close()

    except Exception as e:
        return jsonify({"error": "MFA setup failed"}), 500


@auth_bp.route("/enable-mfa", methods=["POST"])
@jwt_required
def enable_mfa():
    """Enable MFA after verifying token"""
    try:
        data = request.get_json()
        if not data or "token" not in data:
            return jsonify({"error": "MFA token is required"}), 400

        session = db_manager.get_session()
        try:
            user = session.query(User).get(g.current_user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Verify and enable MFA
            if user.enable_mfa(data["token"]):
                session.commit()

                audit_logger.log_authentication_event(
                    AuditEventType.MFA_ENABLED, user_id=user.id, success=True
                )

                return jsonify({"message": "MFA enabled successfully"}), 200
            else:
                return jsonify({"error": "Invalid MFA token"}), 400

        finally:
            session.close()

    except Exception as e:
        return jsonify({"error": "MFA enable failed"}), 500


@auth_bp.route("/disable-mfa", methods=["POST"])
@jwt_required
def disable_mfa():
    """Disable multi-factor authentication"""
    try:
        data = request.get_json()
        if not data or "password" not in data:
            return jsonify({"error": "Password is required"}), 400

        session = db_manager.get_session()
        try:
            user = session.query(User).get(g.current_user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Verify password
            if not user.verify_password(data["password"]):
                return jsonify({"error": "Invalid password"}), 401

            # Disable MFA
            user.disable_mfa()
            session.commit()

            audit_logger.log_authentication_event(
                AuditEventType.MFA_DISABLED, user_id=user.id, success=True
            )

            return jsonify({"message": "MFA disabled successfully"}), 200

        finally:
            session.close()

    except Exception as e:
        return jsonify({"error": "MFA disable failed"}), 500


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required
@rate_limit(limit=5, window=300, scope=RateLimitScope.PER_USER)
def change_password():
    """Change user password"""
    try:
        data = security_validator.validate_json_input(request.get_json())

        # Validate required fields
        required_fields = ["current_password", "new_password"]
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"{field} is required"}), 400

        # Validate new password
        security_validator.validate_password(data["new_password"])

        session = db_manager.get_session()
        try:
            user = session.query(User).get(g.current_user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Verify current password
            if not user.verify_password(data["current_password"]):
                audit_logger.log_authentication_event(
                    AuditEventType.PASSWORD_CHANGE,
                    user_id=user.id,
                    success=False,
                    details={"reason": "invalid_current_password"},
                )
                return jsonify({"error": "Invalid current password"}), 401

            # Set new password
            user.set_password(data["new_password"])
            session.commit()

            audit_logger.log_authentication_event(
                AuditEventType.PASSWORD_CHANGE, user_id=user.id, success=True
            )

            return jsonify({"message": "Password changed successfully"}), 200

        finally:
            session.close()

    except ValidationError as e:
        return jsonify({"error": e.message, "field": e.field}), 400
    except Exception as e:
        return jsonify({"error": "Password change failed"}), 500


@auth_bp.route("/profile", methods=["GET"])
@jwt_required
def get_profile():
    """Get current user profile"""
    try:
        session = db_manager.get_session()
        try:
            user = session.query(User).get(g.current_user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            return jsonify({"user": user.to_dict(include_sensitive=False)}), 200

        finally:
            session.close()

    except Exception as e:
        return jsonify({"error": "Failed to get profile"}), 500


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required
@rate_limit(limit=10, window=300, scope=RateLimitScope.PER_USER)
def update_profile():
    """Update user profile"""
    try:
        data = security_validator.validate_json_input(request.get_json())

        # Check for security threats
        threats = security_validator.check_security_threats(json.dumps(data))
        if threats:
            audit_logger.log_security_alert(
                "profile_update_security_threat",
                user_id=g.current_user_id,
                details={"threats": threats},
            )
            return jsonify({"error": "Invalid input detected"}), 400

        session = db_manager.get_session()
        try:
            user = session.query(User).get(g.current_user_id)
            if not user:
                return jsonify({"error": "User not found"}), 404

            # Update allowed fields
            allowed_fields = [
                "first_name",
                "last_name",
                "phone",
                "city",
                "state",
                "country",
                "postal_code",
            ]

            for field in allowed_fields:
                if field in data:
                    if field in user._encrypted_fields:
                        user.set_encrypted_field(field, data[field], "pii")
                    else:
                        setattr(user, field, data[field])

            session.commit()

            audit_logger.log_data_access(
                action="update",
                resource="user_profile",
                user_id=user.id,
                details={"updated_fields": list(data.keys())},
            )

            return (
                jsonify(
                    {
                        "message": "Profile updated successfully",
                        "user": user.to_dict(include_sensitive=False),
                    }
                ),
                200,
            )

        finally:
            session.close()

    except ValidationError as e:
        return jsonify({"error": e.message, "field": e.field}), 400
    except Exception as e:
        return jsonify({"error": "Profile update failed"}), 500


@auth_bp.route("/verify-token", methods=["POST"])
def verify_token():
    """Verify if a token is valid"""
    try:
        data = request.get_json()
        if not data or "token" not in data:
            return jsonify({"error": "Token is required"}), 400

        payload = auth_manager.verify_token(data["token"])

        if payload:
            return (
                jsonify(
                    {
                        "valid": True,
                        "user_id": payload.get("user_id"),
                        "role": payload.get("role"),
                        "expires_at": payload.get("exp"),
                    }
                ),
                200,
            )
        else:
            return jsonify({"valid": False}), 200

    except Exception as e:
        return jsonify({"error": "Token verification failed"}), 500
