/**
 * Core configuration and utilities for the backend application
 */

import os
import logging
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime, timedelta
import jwt
from functools import wraps

# Configure logging
def setup_logging(app):
    """Configure application logging"""
    if not os.path.exists('logs'):
        os.mkdir('logs')
    
    file_handler = RotatingFileHandler('logs/blockguardian.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('BlockGuardian startup')

# Environment configuration
class Config:
    """Base configuration class"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-key-change-in-production'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database configuration
    DATABASE_URI = os.environ.get('DATABASE_URI') or 'postgresql://postgres:postgres@localhost:5432/blockguardian'
    
    # Redis configuration
    REDIS_URL = os.environ.get('REDIS_URL') or 'redis://localhost:6379/0'
    
    # API keys for external services
    INFURA_API_KEY = os.environ.get('INFURA_API_KEY') or 'your-infura-api-key'
    ETHERSCAN_API_KEY = os.environ.get('ETHERSCAN_API_KEY') or 'your-etherscan-api-key'
    COINMARKETCAP_API_KEY = os.environ.get('COINMARKETCAP_API_KEY') or 'your-coinmarketcap-api-key'
    
    # Blockchain network configurations
    BLOCKCHAIN_NETWORKS = {
        'ethereum': {
            'id': 1,
            'name': 'Ethereum Mainnet',
            'rpc_url': f'https://mainnet.infura.io/v3/{INFURA_API_KEY}',
            'explorer_url': 'https://etherscan.io'
        },
        'polygon': {
            'id': 137,
            'name': 'Polygon Mainnet',
            'rpc_url': 'https://polygon-rpc.com',
            'explorer_url': 'https://polygonscan.com'
        },
        'arbitrum': {
            'id': 42161,
            'name': 'Arbitrum One',
            'rpc_url': 'https://arb1.arbitrum.io/rpc',
            'explorer_url': 'https://arbiscan.io'
        },
        'optimism': {
            'id': 10,
            'name': 'Optimism',
            'rpc_url': 'https://mainnet.optimism.io',
            'explorer_url': 'https://optimistic.etherscan.io'
        },
        'bsc': {
            'id': 56,
            'name': 'BNB Smart Chain',
            'rpc_url': 'https://bsc-dataseed.binance.org',
            'explorer_url': 'https://bscscan.com'
        }
    }
    
    @staticmethod
    def init_app(app):
        """Initialize application with this configuration"""
        pass

class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True
    TESTING = False

class TestingConfig(Config):
    """Testing configuration"""
    DEBUG = False
    TESTING = True
    DATABASE_URI = 'postgresql://postgres:postgres@localhost:5432/blockguardian_test'

class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False
    TESTING = False
    
    @classmethod
    def init_app(cls, app):
        """Initialize production application"""
        Config.init_app(app)
        
        # Log to syslog in production
        import logging
        from logging.handlers import SysLogHandler
        syslog_handler = SysLogHandler()
        syslog_handler.setLevel(logging.INFO)
        app.logger.addHandler(syslog_handler)

# Configuration dictionary
config = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}

# JWT utilities
def generate_token(user_id, expiration=None):
    """Generate a JWT token for a user"""
    payload = {
        'sub': user_id,
        'iat': datetime.utcnow(),
        'exp': datetime.utcnow() + (expiration or Config.JWT_ACCESS_TOKEN_EXPIRES)
    }
    return jwt.encode(payload, Config.JWT_SECRET_KEY, algorithm='HS256')

def decode_token(token):
    """Decode a JWT token"""
    try:
        payload = jwt.decode(token, Config.JWT_SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return {'error': 'Token expired'}
    except jwt.InvalidTokenError:
        return {'error': 'Invalid token'}

def token_required(f):
    """Decorator for routes that require a valid token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask import request, jsonify
        
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Token is missing or invalid'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            payload = decode_token(token)
            if 'error' in payload:
                return jsonify({'message': payload['error']}), 401
            
            # Add user_id to kwargs
            kwargs['user_id'] = payload['sub']
        except:
            return jsonify({'message': 'Token is invalid'}), 401
        
        return f(*args, **kwargs)
    
    return decorated

# Response utilities
def create_response(data=None, message=None, status=200):
    """Create a standardized API response"""
    response = {
        'status': 'success' if status < 400 else 'error',
        'timestamp': datetime.utcnow().isoformat()
    }
    
    if message:
        response['message'] = message
    
    if data is not None:
        response['data'] = data
    
    return response, status
