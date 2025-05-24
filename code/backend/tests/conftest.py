import pytest
from fastapi.testclient import TestClient
import sys
import os

# Define the absolute path to the backend source directory
backend_src_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../BlockGuardian_Project/backend"))

# Add the backend source directory to the Python path
if backend_src_path not in sys.path:
    sys.path.insert(0, backend_src_path)

# Attempt to import the FastAPI app instance from the actual project
# This assumes the main app instance is named 'app' in 'main.py' within the 'app' directory
try:
    # Adjust the import based on the actual structure found in BlockGuardian_Project/backend
    # Example: If main.py is directly under backend, use 'from main import app'
    # Example: If main.py is under backend/app, use 'from app.main import app'
    from app.main import app # Assuming structure is backend/app/main.py
except ImportError as e:
    print(f"Warning: Could not import FastAPI app from '{backend_src_path}'. Using a dummy app for testing structure. Error: {e}")
    # Define a dummy app if import fails, so tests can be structured
    from fastapi import FastAPI
    app = FastAPI()
    @app.get("/")
    async def read_root():
        return {"message": "Dummy App - Real app not found"}

@pytest.fixture(scope="module")
def client():
    """Provides a TestClient instance for API testing."""
    # Use the imported app (real or dummy)
    with TestClient(app) as c:
        yield c

# Add other fixtures as needed, e.g., for database sessions.
# Ensure these fixtures connect to a test database or use appropriate mocking.
# Example (requires database setup):
# from app.db.database import SessionLocal, engine, Base
# from app.models import models # Assuming models are defined

# @pytest.fixture(scope="session", autouse=True)
# def setup_test_db():
#     """Creates test database tables before tests run and drops them after."""
#     Base.metadata.create_all(bind=engine) # Use a test database engine
#     yield
#     Base.metadata.drop_all(bind=engine)

# @pytest.fixture(scope="function")
# def db_session():
#     """Provides a database session for integration tests."""
#     connection = engine.connect()
#     transaction = connection.begin()
#     session = SessionLocal(bind=connection)
#     yield session
#     session.close()
#     transaction.rollback()
#     connection.close()




# Add fixtures for database setup and session management for integration tests
from app.db.database import SessionLocal, engine, Base, SQLALCHEMY_DATABASE_URL
from app.models import models # Assuming models are defined in app/models/models.py

# Use a separate test database (e.g., in-memory SQLite or a dedicated test PostgreSQL DB)
# For simplicity, we can modify the existing SQLite URL or use an in-memory one
TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///./test_quantumnest.db"
# TEST_SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

# Override the engine and SessionLocal for testing
test_engine = create_engine(
    TEST_SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    """Creates test database tables before tests run and drops them after."""
    # Ensure the test database file exists if using file-based SQLite
    if "sqlite:///./" in TEST_SQLALCHEMY_DATABASE_URL:
        db_file = TEST_SQLALCHEMY_DATABASE_URL.replace("sqlite:///./", "")
        if os.path.exists(db_file):
            os.remove(db_file)
            
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    # Clean up the test database file
    if "sqlite:///./" in TEST_SQLALCHEMY_DATABASE_URL:
        if os.path.exists(db_file):
            os.remove(db_file)

@pytest.fixture(scope="function")
def db_session():
    """Provides a transactional database session for integration tests."""
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)
    yield session
    session.close()
    transaction.rollback()
    connection.close()

# Fixture to override the get_db dependency in the FastAPI app during testing
# This ensures API tests use the test database session
def override_get_db():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestSessionLocal(bind=connection)
    try:
        yield session
    finally:
        session.close()
        transaction.rollback()
        connection.close()

# Apply the dependency override to the app used by the TestClient
app.dependency_overrides[get_db] = override_get_db

# TODO: Add fixtures for creating test data (e.g., test users)
# @pytest.fixture(scope="function")
# def test_user(db_session):
#     from app.main import get_password_hash
#     user_data = {
#         "email": "testuser@example.com",
#         "hashed_password": get_password_hash("password123"),
#         "is_active": True,
#         # Add other necessary fields from models.User
#     }
#     user = models.User(**user_data)
#     db_session.add(user)
#     db_session.commit()
#     db_session.refresh(user)
#     # Return dict with original password for login tests
#     return {"email": "testuser@example.com", "password": "password123", "db_obj": user}

