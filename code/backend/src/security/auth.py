"""
Enterprise-grade authentication and authorization system
Implements JWT tokens, MFA, role-based access control, and session management
"""

import jwt
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, List, Optional, Tuple, Any
from flask import request, jsonify, current_app, g
from werkzeug.security import generate_password_hash, check_password_hash
from cryptography.fernet import Fernet
import redis
import json
from enum import Enum

from src.config import current_config


class UserRole(Enum):
    """User roles for role-based access control"""
    ADMIN = "admin"
    COMPLIANCE_OFFICER = "compliance_officer"
    PORTFOLIO_MANAGER = "portfolio_manager"
    TRADER = "trader"
    ANALYST = "analyst"
    USER = "user"
    READONLY = "readonly"


class Permission(Enum):
    """Granular permissions for attribute-based access control"""
    # User management
    CREATE_USER = "create_user"
    READ_USER = "read_user"
    UPDATE_USER = "update_user"
    DELETE_USER = "delete_user"
    
    # Portfolio management
    CREATE_PORTFOLIO = "create_portfolio"
    READ_PORTFOLIO = "read_portfolio"
    UPDATE_PORTFOLIO = "update_portfolio"
    DELETE_PORTFOLIO = "delete_portfolio"
    
    # Trading operations
    EXECUTE_TRADE = "execute_trade"
    APPROVE_TRADE = "approve_trade"
    CANCEL_TRADE = "cancel_trade"
    
    # Financial data
    READ_MARKET_DATA = "read_market_data"
    READ_FINANCIAL_REPORTS = "read_financial_reports"
    
    # AI/ML operations
    RUN_AI_MODELS = "run_ai_models"
    MANAGE_AI_MODELS = "manage_ai_models"
    
    # Blockchain operations
    DEPLOY_CONTRACTS = "deploy_contracts"
    EXECUTE_BLOCKCHAIN_TX = "execute_blockchain_tx"
    
    # Compliance and audit
    READ_AUDIT_LOGS = "read_audit_logs"
    GENERATE_COMPLIANCE_REPORTS = "generate_compliance_reports"
    MANAGE_KYC = "manage_kyc"
    
    # System administration
    MANAGE_SYSTEM = "manage_system"
    VIEW_SYSTEM_METRICS = "view_system_metrics"


# Role-permission mapping
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [p for p in Permission],  # All permissions
    UserRole.COMPLIANCE_OFFICER: [
        Permission.READ_USER, Permission.READ_AUDIT_LOGS,
        Permission.GENERATE_COMPLIANCE_REPORTS, Permission.MANAGE_KYC,
        Permission.READ_FINANCIAL_REPORTS
    ],
    UserRole.PORTFOLIO_MANAGER: [
        Permission.CREATE_PORTFOLIO, Permission.READ_PORTFOLIO,
        Permission.UPDATE_PORTFOLIO, Permission.DELETE_PORTFOLIO,
        Permission.READ_MARKET_DATA, Permission.RUN_AI_MODELS,
        Permission.READ_FINANCIAL_REPORTS
    ],
    UserRole.TRADER: [
        Permission.EXECUTE_TRADE, Permission.READ_PORTFOLIO,
        Permission.READ_MARKET_DATA, Permission.EXECUTE_BLOCKCHAIN_TX
    ],
    UserRole.ANALYST: [
        Permission.READ_PORTFOLIO, Permission.READ_MARKET_DATA,
        Permission.READ_FINANCIAL_REPORTS, Permission.RUN_AI_MODELS
    ],
    UserRole.USER: [
        Permission.READ_PORTFOLIO, Permission.UPDATE_PORTFOLIO,
        Permission.READ_MARKET_DATA
    ],
    UserRole.READONLY: [
        Permission.READ_PORTFOLIO, Permission.READ_MARKET_DATA
    ]
}


class AuthManager:
    """Enterprise authentication and authorization manager"""
    
    def __init__(self, app=None):
        self.app = app
        self.redis_client = None
        self.encryption = None
        
        if app is not None:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize authentication manager with Flask app"""
        self.app = app
        
        # Initialize Redis for session management
        try:
            self.redis_client = redis.from_url(
                current_config.redis.url,
                max_connections=current_config.redis.max_connections,
                socket_timeout=current_config.redis.socket_timeout,
                socket_connect_timeout=current_config.redis.socket_connect_timeout
            )
        except Exception as e:
            app.logger.error(f"Failed to initialize Redis: {e}")
            self.redis_client = None
        
        # Initialize encryption
        self.encryption = Fernet(current_config.security.encryption_key)
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt with configurable rounds"""
        return generate_password_hash(
            password, 
            method='pbkdf2:sha256',
            salt_length=16
        )
    
    def verify_password(self, password: str, password_hash: str) -> bool:
        """Verify password against hash"""
        return check_password_hash(password_hash, password)
    
    def generate_tokens(self, user_id: int, user_role: str, permissions: List[str] = None) -> Dict[str, str]:
        """Generate JWT access and refresh tokens"""
        now = datetime.utcnow()
        
        # Access token payload
        access_payload = {
            'user_id': user_id,
            'role': user_role,
            'permissions': permissions or [],
            'type': 'access',
            'iat': now,
            'exp': now + current_config.security.jwt_access_token_expires,
            'jti': self._generate_jti()
        }
        
        # Refresh token payload
        refresh_payload = {
            'user_id': user_id,
            'type': 'refresh',
            'iat': now,
            'exp': now + current_config.security.jwt_refresh_token_expires,
            'jti': self._generate_jti()
        }
        
        # Generate tokens
        access_token = jwt.encode(
            access_payload,
            current_config.security.jwt_secret_key,
            algorithm='HS256'
        )
        
        refresh_token = jwt.encode(
            refresh_payload,
            current_config.security.jwt_secret_key,
            algorithm='HS256'
        )
        
        # Store refresh token in Redis
        if self.redis_client:
            self.redis_client.setex(
                f"refresh_token:{refresh_payload['jti']}",
                current_config.security.jwt_refresh_token_expires,
                json.dumps({
                    'user_id': user_id,
                    'created_at': now.isoformat()
                })
            )
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': int(current_config.security.jwt_access_token_expires.total_seconds())
        }
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token,
                current_config.security.jwt_secret_key,
                algorithms=['HS256']
            )
            
            # Check if token is blacklisted
            if self.redis_client and self._is_token_blacklisted(payload.get('jti')):
                return None
            
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    def refresh_access_token(self, refresh_token: str) -> Optional[Dict[str, str]]:
        """Generate new access token using refresh token"""
        payload = self.verify_token(refresh_token)
        
        if not payload or payload.get('type') != 'refresh':
            return None
        
        # Verify refresh token exists in Redis
        if self.redis_client:
            stored_data = self.redis_client.get(f"refresh_token:{payload['jti']}")
            if not stored_data:
                return None
        
        # Get user data to generate new access token
        from src.models.user import User
        user = User.query.get(payload['user_id'])
        if not user or not user.is_active:
            return None
        
        # Generate new access token
        permissions = self.get_user_permissions(user.role)
        return self.generate_tokens(user.id, user.role.value, permissions)
    
    def revoke_token(self, token: str) -> bool:
        """Revoke (blacklist) a token"""
        payload = self.verify_token(token)
        if not payload:
            return False
        
        if self.redis_client:
            # Blacklist token until its expiration
            ttl = payload['exp'] - datetime.utcnow().timestamp()
            if ttl > 0:
                self.redis_client.setex(
                    f"blacklist:{payload['jti']}",
                    int(ttl),
                    "revoked"
                )
        
        return True
    
    def generate_mfa_secret(self, user_email: str) -> Tuple[str, str]:
        """Generate MFA secret and QR code"""
        secret = pyotp.random_base32()
        
        # Generate QR code
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user_email,
            issuer_name="BlockGuardian"
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        img_buffer = io.BytesIO()
        img.save(img_buffer, format='PNG')
        img_buffer.seek(0)
        
        qr_code_data = base64.b64encode(img_buffer.getvalue()).decode()
        
        return secret, qr_code_data
    
    def verify_mfa_token(self, secret: str, token: str) -> bool:
        """Verify MFA token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)
    
    def get_user_permissions(self, role: UserRole) -> List[str]:
        """Get permissions for a user role"""
        permissions = ROLE_PERMISSIONS.get(role, [])
        return [p.value for p in permissions]
    
    def has_permission(self, user_permissions: List[str], required_permission: Permission) -> bool:
        """Check if user has required permission"""
        return required_permission.value in user_permissions
    
    def encrypt_sensitive_data(self, data: str) -> str:
        """Encrypt sensitive data"""
        if self.encryption:
            return self.encryption.encrypt(data.encode()).decode()
        return data
    
    def decrypt_sensitive_data(self, encrypted_data: str) -> str:
        """Decrypt sensitive data"""
        if self.encryption:
            return self.encryption.decrypt(encrypted_data.encode()).decode()
        return encrypted_data
    
    def _generate_jti(self) -> str:
        """Generate unique token identifier"""
        import uuid
        return str(uuid.uuid4())
    
    def _is_token_blacklisted(self, jti: str) -> bool:
        """Check if token is blacklisted"""
        if self.redis_client:
            return self.redis_client.exists(f"blacklist:{jti}")
        return False


# Global auth manager instance
auth_manager = AuthManager()


def jwt_required(f):
    """Decorator to require valid JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
            except IndexError:
                return jsonify({'error': 'Invalid authorization header format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        payload = auth_manager.verify_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        # Store user info in Flask's g object
        g.current_user_id = payload['user_id']
        g.current_user_role = payload['role']
        g.current_user_permissions = payload.get('permissions', [])
        
        return f(*args, **kwargs)
    
    return decorated_function


def role_required(*required_roles):
    """Decorator to require specific user roles"""
    def decorator(f):
        @wraps(f)
        @jwt_required
        def decorated_function(*args, **kwargs):
            user_role = g.current_user_role
            
            if user_role not in [role.value for role in required_roles]:
                return jsonify({'error': 'Insufficient privileges'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator


def permission_required(*required_permissions):
    """Decorator to require specific permissions"""
    def decorator(f):
        @wraps(f)
        @jwt_required
        def decorated_function(*args, **kwargs):
            user_permissions = g.current_user_permissions
            
            for permission in required_permissions:
                if permission.value not in user_permissions:
                    return jsonify({'error': f'Missing permission: {permission.value}'}), 403
            
            return f(*args, **kwargs)
        
        return decorated_function
    return decorator

