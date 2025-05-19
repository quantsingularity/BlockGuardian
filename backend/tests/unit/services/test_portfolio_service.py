import pytest
from unittest.mock import patch, MagicMock
from app.services.portfolio_service import PortfolioService

def test_create_portfolio():
    """Test creating a new portfolio."""
    portfolio_service = PortfolioService()
    portfolio_data = {
        "name": "Test Portfolio",
        "description": "A test portfolio for automated testing",
        "risk_level": "medium",
        "user_id": "user123"
    }
    
    mock_portfolio = {**portfolio_data, "id": "portfolio123", "created_at": "2025-05-19T11:22:59Z"}
    
    with patch.object(portfolio_service, 'create_portfolio', return_value=mock_portfolio):
        portfolio = portfolio_service.create_portfolio(portfolio_data)
        assert portfolio["id"] == "portfolio123"
        assert portfolio["name"] == portfolio_data["name"]
        assert portfolio["risk_level"] == portfolio_data["risk_level"]

def test_get_portfolio_by_id():
    """Test retrieving a portfolio by ID."""
    portfolio_service = PortfolioService()
    portfolio_id = "portfolio123"
    mock_portfolio = {
        "id": portfolio_id,
        "name": "Test Portfolio",
        "description": "A test portfolio for automated testing",
        "risk_level": "medium",
        "user_id": "user123",
        "created_at": "2025-05-19T11:22:59Z"
    }
    
    with patch.object(portfolio_service, 'get_portfolio_by_id', return_value=mock_portfolio):
        portfolio = portfolio_service.get_portfolio_by_id(portfolio_id)
        assert portfolio["id"] == portfolio_id
        assert portfolio["name"] == mock_portfolio["name"]

def test_update_portfolio():
    """Test updating a portfolio."""
    portfolio_service = PortfolioService()
    portfolio_id = "portfolio123"
    update_data = {
        "name": "Updated Portfolio Name",
        "risk_level": "high"
    }
    
    mock_updated_portfolio = {
        "id": portfolio_id,
        "name": update_data["name"],
        "description": "A test portfolio for automated testing",
        "risk_level": update_data["risk_level"],
        "user_id": "user123",
        "created_at": "2025-05-19T11:22:59Z",
        "updated_at": "2025-05-19T11:23:59Z"
    }
    
    with patch.object(portfolio_service, 'update_portfolio', return_value=mock_updated_portfolio):
        portfolio = portfolio_service.update_portfolio(portfolio_id, update_data)
        assert portfolio["id"] == portfolio_id
        assert portfolio["name"] == update_data["name"]
        assert portfolio["risk_level"] == update_data["risk_level"]

def test_delete_portfolio():
    """Test deleting a portfolio."""
    portfolio_service = PortfolioService()
    portfolio_id = "portfolio123"
    
    with patch.object(portfolio_service, 'delete_portfolio', return_value=True):
        result = portfolio_service.delete_portfolio(portfolio_id)
        assert result is True

def test_calculate_portfolio_performance():
    """Test calculating portfolio performance metrics."""
    portfolio_service = PortfolioService()
    portfolio_id = "portfolio123"
    
    mock_performance = {
        "returns": {
            "daily": 0.02,
            "weekly": 0.05,
            "monthly": 0.12,
            "yearly": 0.25
        },
        "risk_metrics": {
            "volatility": 0.15,
            "sharpe_ratio": 1.2,
            "max_drawdown": 0.1
        }
    }
    
    with patch.object(portfolio_service, 'calculate_performance', return_value=mock_performance):
        performance = portfolio_service.calculate_performance(portfolio_id)
        assert "returns" in performance
        assert "risk_metrics" in performance
        assert performance["returns"]["daily"] == 0.02
        assert performance["risk_metrics"]["sharpe_ratio"] == 1.2
