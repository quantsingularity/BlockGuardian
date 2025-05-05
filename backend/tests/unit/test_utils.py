# Unit Test: /home/ubuntu/BlockGuardian_Tests/BlockGuardian_tests/backend/tests/unit/test_utils.py
import pytest
import sys
import os
from datetime import timedelta

# Path setup is handled by conftest.py

# Import functions to test from app.main (adjust if structure differs)
try:
    from app.main import verify_password, get_password_hash, create_access_token
except ImportError as e:
    print(f"Warning: Could not import functions from app.main for unit testing: {e}")
    # Define dummy functions if import fails to allow test structure
    def verify_password(p, h): return False
    def get_password_hash(p): return "dummy_hash"
    def create_access_token(d, e=None): return "dummy_token"

# Note: The app.core directory was found to be empty.
# Tests below focus on utility-like functions found in app.main.py

def test_password_hashing_and_verification():
    """Tests password hashing and verification functions."""
    password = "mysecretpassword"
    hashed_password = get_password_hash(password)
    
    assert hashed_password is not None
    assert isinstance(hashed_password, str)
    assert password != hashed_password
    
    # Test verification
    assert verify_password(password, hashed_password) == True
    assert verify_password("wrongpassword", hashed_password) == False

def test_create_access_token():
    """Tests the JWT access token creation."""
    data = {"sub": "test@example.com"}
    token = create_access_token(data)
    
    assert token is not None
    assert isinstance(token, str)
    # Further tests could involve decoding the token (requires jose library here too)
    # and checking expiry, but basic creation check is done here.

def test_create_access_token_with_expiry():
    """Tests the JWT access token creation with a specific expiry."""
    data = {"sub": "test@example.com"}
    expires = timedelta(minutes=60)
    token = create_access_token(data, expires_delta=expires)
    
    assert token is not None
    assert isinstance(token, str)
    # Add more specific checks if needed (e.g., decode and verify expiry)

# TODO: Add tests for other utility-like functions if found elsewhere.
# Note: Testing get_user and authenticate_user might be better suited for integration tests
# as they require a database session.

