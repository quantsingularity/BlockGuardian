import pytest
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_analysis_endpoint():
    test_tx = {
        "tx_hash": "0x123...",
        "value": 100.0,
        "sender": "0xabc...",
        "receiver": "0xdef...",
        "timestamp": 1633045025
    }
    response = client.post("/analyze", json=test_tx)
    assert response.status_code == 200
    assert "risk_score" in response.json()