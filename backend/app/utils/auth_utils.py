"""
Authentication utility functions for the BlockGuardian application.
This module provides common authentication-related functionality used across the application.
"""

import os
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "development_secret_key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

class AuthUtils:
    """Utility class for authentication operations."""
    
    @staticmethod
    def verify_password(plain_password, hashed_password):
        """
        Verify a password against a hash.
        
        Args:
            plain_password (str): Plain text password
            hashed_password (str): Hashed password
            
        Returns:
            bool: True if password matches hash
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password):
        """
        Hash a password.
        
        Args:
            password (str): Plain text password
            
        Returns:
            str: Hashed password
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data, expires_delta=None):
        """
        Create a JWT access token.
        
        Args:
            data (dict): Data to encode in the token
            expires_delta (timedelta, optional): Token expiration time. 
                                               Defaults to ACCESS_TOKEN_EXPIRE_MINUTES.
            
        Returns:
            str: JWT token
        """
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
            
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def decode_token(token):
        """
        Decode a JWT token.
        
        Args:
            token (str): JWT token
            
        Returns:
            dict: Decoded token payload
            
        Raises:
            jwt.PyJWTError: If token is invalid
        """
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    
    @staticmethod
    def get_user_id_from_token(token):
        """
        Extract user ID from a JWT token.
        
        Args:
            token (str): JWT token
            
        Returns:
            str: User ID
            
        Raises:
            jwt.PyJWTError: If token is invalid
            KeyError: If user_id not in token
        """
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")  # "sub" is standard JWT claim for subject (user_id)
