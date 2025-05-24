# API Test: /home/ubuntu/BlockGuardian_Tests/BlockGuardian_tests/backend/tests/api/test_main_endpoints.py
import pytest
from fastapi.testclient import TestClient
from fastapi import status

# The client fixture is provided by conftest.py and uses the real or dummy app

def test_read_root(client: TestClient):
    """Tests the root endpoint (/)."""
    try:
        response = client.get("/")
        response.raise_for_status() # Raise an exception for bad status codes (4xx or 5xx)
        # Assert based on the actual root endpoint response from app/main.py
        assert response.json() == {"message": "Welcome to QuantumNest Capital API"}
        assert response.status_code == status.HTTP_200_OK
    except Exception as e:
        pytest.fail(f"API request to / failed: {e}")

def test_health_check(client: TestClient):
    """Tests the health check endpoint (/health)."""
    try:
        response = client.get("/health")
        response.raise_for_status()
        # Assert based on the actual health check response from app/main.py
        assert response.json() == {"status": "healthy"}
        assert response.status_code == status.HTTP_200_OK
    except Exception as e:
        pytest.fail(f"API request to /health failed: {e}")

def test_login_for_access_token_invalid_credentials(client: TestClient):
    """Tests the /token endpoint with invalid credentials."""
    response = client.post("/token", data={"username": "invalid@example.com", "password": "wrongpassword"})
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Incorrect username or password" in response.json().get("detail", "")

# TODO: Implement test for valid login after setting up test user fixtures
# def test_login_for_access_token_valid_credentials(client: TestClient, test_user):
#     """Tests the /token endpoint with valid credentials."""
#     response = client.post("/token", data={"username": test_user["email"], "password": test_user["password"]})
#     assert response.status_code == status.HTTP_200_OK
#     token_data = response.json()
#     assert "access_token" in token_data
#     assert token_data["token_type"] == "bearer"

# TODO: Add more API tests for all defined endpoints in included routers
# (users, portfolio, market, ai, blockchain, admin)
# - Requires understanding the specific endpoints defined in those router files
# - Requires setting up necessary test data (e.g., users, portfolios) via fixtures

