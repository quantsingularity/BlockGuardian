# Integration Test: /home/ubuntu/BlockGuardian_Tests/BlockGuardian_tests/backend/tests/integration/test_db_operations.py
import pytest
import sys
import os
from sqlalchemy.orm import Session

# Path setup is handled by conftest.py

# Import models and schemas from the BlockGuardian project
try:
    from app.models import models
    from app.schemas import schemas
    from app.main import get_password_hash # Import hashing function if needed for user creation
except ImportError as e:
    print(f"Warning: Could not import models/schemas for integration testing: {e}")
    # Define dummy classes if import fails to allow test structure
    class DummyModel:
        pass
    models = type("models", (), {"User": DummyModel, "Portfolio": DummyModel, "Asset": DummyModel})()
    schemas = type("schemas", (), {"UserCreate": object, "PortfolioCreate": object})()
    def get_password_hash(p): return "dummy_hash"

# The db_session fixture is defined in conftest.py and injected here
def test_create_and_get_user(db_session: Session): # Inject db_session fixture
    """Tests creating and retrieving a User in the test database."""
    user_email = "integration_test@example.com"
    user_password = "testpassword"
    
    # Create User
    hashed_password = get_password_hash(user_password)
    user_in = models.User(
        email=user_email,
        hashed_password=hashed_password,
        name="Integration Test User",
        is_active=True
    )
    db_session.add(user_in)
    db_session.commit()
    db_session.refresh(user_in)
    
    assert user_in.id is not None
    assert user_in.email == user_email
    assert user_in.name == "Integration Test User"
    
    # Retrieve User
    user_out = db_session.query(models.User).filter(models.User.email == user_email).first()
    
    assert user_out is not None
    assert user_out.id == user_in.id
    assert user_out.email == user_email
    assert user_out.hashed_password == hashed_password

def test_create_portfolio_for_user(db_session: Session):
    """Tests creating a Portfolio associated with a User."""
    # First, create a user to associate the portfolio with
    user_email = "portfolio_owner@example.com"
    hashed_password = get_password_hash("ownerpass")
    owner = models.User(email=user_email, hashed_password=hashed_password, name="Portfolio Owner")
    db_session.add(owner)
    db_session.commit()
    db_session.refresh(owner)
    
    # Create Portfolio
    portfolio_name = "My Test Portfolio"
    portfolio_in = models.Portfolio(
        name=portfolio_name,
        description="Integration test portfolio",
        owner_id=owner.id
    )
    db_session.add(portfolio_in)
    db_session.commit()
    db_session.refresh(portfolio_in)
    
    assert portfolio_in.id is not None
    assert portfolio_in.name == portfolio_name
    assert portfolio_in.owner_id == owner.id
    
    # Retrieve Portfolio and check relationship
    portfolio_out = db_session.query(models.Portfolio).filter(models.Portfolio.id == portfolio_in.id).first()
    assert portfolio_out is not None
    assert portfolio_out.owner.email == user_email

# TODO: Add more integration tests for other models and relationships
# - Creating Assets
# - Adding Assets to Portfolios (PortfolioAsset)
# - Recording Transactions
# - Testing relationships (e.g., retrieving a user's portfolios)
# - Testing updates and deletions

