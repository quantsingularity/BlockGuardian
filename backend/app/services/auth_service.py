/**
 * Authentication service for user management
 */

from datetime import datetime, timedelta
import jwt
import bcrypt
from sqlalchemy.exc import IntegrityError

from app.models.models import User
from app.core.config import Config, generate_token, decode_token
from app.db.database import db

class AuthService:
    """Service for user authentication and management"""
    
    @staticmethod
    def register_user(email, password, username=None):
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                return {'error': 'User with this email already exists'}, 409
            
            # Hash password
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
            # Create new user
            new_user = User(
                email=email,
                password_hash=password_hash.decode('utf-8'),
                username=username or email.split('@')[0],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow()
            )
            
            # Save to database
            db.session.add(new_user)
            db.session.commit()
            
            # Generate tokens
            access_token = generate_token(new_user.id)
            refresh_token = generate_token(
                new_user.id, 
                expiration=Config.JWT_REFRESH_TOKEN_EXPIRES
            )
            
            return {
                'user': {
                    'id': new_user.id,
                    'email': new_user.email,
                    'username': new_user.username,
                    'created_at': new_user.created_at.isoformat()
                },
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 201
            
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Database error occurred'}, 500
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def login_user(email, password):
        """Login a user"""
        try:
            # Find user by email
            user = User.query.filter_by(email=email).first()
            if not user:
                return {'error': 'Invalid email or password'}, 401
            
            # Check password
            if not bcrypt.checkpw(password.encode('utf-8'), user.password_hash.encode('utf-8')):
                return {'error': 'Invalid email or password'}, 401
            
            # Generate tokens
            access_token = generate_token(user.id)
            refresh_token = generate_token(
                user.id, 
                expiration=Config.JWT_REFRESH_TOKEN_EXPIRES
            )
            
            # Update last login
            user.last_login = datetime.utcnow()
            db.session.commit()
            
            return {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'created_at': user.created_at.isoformat()
                },
                'access_token': access_token,
                'refresh_token': refresh_token
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def refresh_token(refresh_token):
        """Refresh access token using refresh token"""
        try:
            # Decode refresh token
            payload = decode_token(refresh_token)
            if 'error' in payload:
                return {'error': payload['error']}, 401
            
            # Get user ID from token
            user_id = payload['sub']
            
            # Check if user exists
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            # Generate new access token
            new_access_token = generate_token(user.id)
            
            return {
                'access_token': new_access_token
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def get_user_by_id(user_id):
        """Get user by ID"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            return {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'created_at': user.created_at.isoformat(),
                    'last_login': user.last_login.isoformat() if user.last_login else None
                }
            }, 200
            
        except Exception as e:
            return {'error': str(e)}, 500
    
    @staticmethod
    def update_user(user_id, user_data):
        """Update user information"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            # Update fields
            if 'username' in user_data:
                user.username = user_data['username']
            
            if 'email' in user_data:
                # Check if email is already taken
                existing_user = User.query.filter_by(email=user_data['email']).first()
                if existing_user and existing_user.id != user_id:
                    return {'error': 'Email already in use'}, 409
                
                user.email = user_data['email']
            
            if 'password' in user_data:
                # Hash new password
                password_hash = bcrypt.hashpw(user_data['password'].encode('utf-8'), bcrypt.gensalt())
                user.password_hash = password_hash.decode('utf-8')
            
            # Update timestamp
            user.updated_at = datetime.utcnow()
            
            # Save changes
            db.session.commit()
            
            return {
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'username': user.username,
                    'updated_at': user.updated_at.isoformat()
                }
            }, 200
            
        except IntegrityError:
            db.session.rollback()
            return {'error': 'Database error occurred'}, 500
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
    
    @staticmethod
    def delete_user(user_id):
        """Delete a user"""
        try:
            user = User.query.get(user_id)
            if not user:
                return {'error': 'User not found'}, 404
            
            # Delete user
            db.session.delete(user)
            db.session.commit()
            
            return {
                'message': 'User deleted successfully'
            }, 200
            
        except Exception as e:
            db.session.rollback()
            return {'error': str(e)}, 500
