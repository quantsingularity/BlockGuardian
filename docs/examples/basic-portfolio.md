# Basic Portfolio Management

This example demonstrates how to create and manage portfolios using BlockGuardian.

## Prerequisites

- BlockGuardian backend running (`./scripts/run_blockguardian.sh`)
- Valid user account and authentication token

## Step 1: Authenticate

First, obtain an authentication token:

```bash
# Register (if needed)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!",
    "first_name": "Demo",
    "last_name": "User"
  }'

# Login
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "SecurePass123!"
  }' | jq -r '.access_token')

echo "Token: $TOKEN"
```

## Step 2: Create Portfolio

Create a new investment portfolio:

```bash
curl -X POST http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Growth Portfolio",
    "description": "Long-term cryptocurrency growth strategy",
    "risk_tolerance": "high",
    "target_return": 25.0
  }'
```

**Expected Response:**

```json
{
    "id": "pf_abc123",
    "name": "Growth Portfolio",
    "description": "Long-term cryptocurrency growth strategy",
    "risk_tolerance": "high",
    "target_return": 25.0,
    "total_value": 0.0,
    "created_at": "2025-12-30T10:00:00Z",
    "owner_id": "usr_def456"
}
```

Save the portfolio ID for next steps:

```bash
PORTFOLIO_ID="pf_abc123"
```

## Step 3: Add Assets

Add cryptocurrency assets to the portfolio:

```bash
# Add Bitcoin (40% allocation)
curl -X POST http://localhost:5000/api/portfolios/$PORTFOLIO_ID/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "amount": 0.5,
    "target_allocation": 40.0,
    "purchase_price": 45000.00
  }'

# Add Ethereum (30% allocation)
curl -X POST http://localhost:5000/api/portfolios/$PORTFOLIO_ID/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ETH",
    "amount": 5.0,
    "target_allocation": 30.0,
    "purchase_price": 3000.00
  }'

# Add Solana (20% allocation)
curl -X POST http://localhost:5000/api/portfolios/$PORTFOLIO_ID/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "SOL",
    "amount": 100.0,
    "target_allocation": 20.0,
    "purchase_price": 100.00
  }'

# Add Cardano (10% allocation)
curl -X POST http://localhost:5000/api/portfolios/$PORTFOLIO_ID/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ADA",
    "amount": 5000.0,
    "target_allocation": 10.0,
    "purchase_price": 0.50
  }'
```

## Step 4: View Portfolio Details

Get detailed portfolio information:

```bash
curl http://localhost:5000/api/portfolios/$PORTFOLIO_ID \
  -H "Authorization: Bearer $TOKEN" | jq
```

**Expected Response:**

```json
{
    "id": "pf_abc123",
    "name": "Growth Portfolio",
    "description": "Long-term cryptocurrency growth strategy",
    "risk_tolerance": "high",
    "target_return": 25.0,
    "total_value": 50000.0,
    "created_at": "2025-01-01T00:00:00Z",
    "last_updated": "2025-12-30T10:00:00Z",
    "assets": [
        {
            "id": "asset_001",
            "symbol": "BTC",
            "name": "Bitcoin",
            "amount": 0.5,
            "current_price": 45000.0,
            "total_value": 22500.0,
            "allocation": 45.0,
            "target_allocation": 40.0,
            "change_24h": 2.5
        },
        {
            "id": "asset_002",
            "symbol": "ETH",
            "name": "Ethereum",
            "amount": 5.0,
            "current_price": 3000.0,
            "total_value": 15000.0,
            "allocation": 30.0,
            "target_allocation": 30.0,
            "change_24h": 1.8
        },
        {
            "id": "asset_003",
            "symbol": "SOL",
            "name": "Solana",
            "amount": 100.0,
            "current_price": 100.0,
            "total_value": 10000.0,
            "allocation": 20.0,
            "target_allocation": 20.0,
            "change_24h": -0.5
        },
        {
            "id": "asset_004",
            "symbol": "ADA",
            "name": "Cardano",
            "amount": 5000.0,
            "current_price": 0.5,
            "total_value": 2500.0,
            "allocation": 5.0,
            "target_allocation": 10.0,
            "change_24h": 0.2
        }
    ],
    "performance": {
        "24h": 2.1,
        "7d": 5.2,
        "30d": 12.8,
        "ytd": 45.3,
        "all_time": 25.0
    }
}
```

## Step 5: List All Portfolios

View all your portfolios:

```bash
curl "http://localhost:5000/api/portfolios?page=1&per_page=10" \
  -H "Authorization: Bearer $TOKEN" | jq
```

## Step 6: Update Portfolio

Modify portfolio settings:

```bash
curl -X PATCH http://localhost:5000/api/portfolios/$PORTFOLIO_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Growth Portfolio",
    "description": "Diversified long-term strategy",
    "target_return": 30.0
  }'
```

## Python Example

Using the Python requests library:

```python
import requests

# Configuration
API_URL = "http://localhost:5000"
EMAIL = "demo@example.com"
PASSWORD = "SecurePass123!"

# Authenticate
login_response = requests.post(
    f"{API_URL}/api/auth/login",
    json={"email": EMAIL, "password": PASSWORD}
)
token = login_response.json()["access_token"]

# Set headers
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# Create portfolio
portfolio_data = {
    "name": "Python Portfolio",
    "description": "Created via Python",
    "risk_tolerance": "moderate",
    "target_return": 15.0
}

create_response = requests.post(
    f"{API_URL}/api/portfolios",
    headers=headers,
    json=portfolio_data
)

portfolio = create_response.json()
portfolio_id = portfolio["id"]
print(f"Created portfolio: {portfolio_id}")

# Add asset
asset_data = {
    "symbol": "BTC",
    "amount": 0.1,
    "target_allocation": 50.0,
    "purchase_price": 45000.00
}

asset_response = requests.post(
    f"{API_URL}/api/portfolios/{portfolio_id}/assets",
    headers=headers,
    json=asset_data
)

print(f"Added asset: {asset_response.json()}")

# Get portfolio details
portfolio_response = requests.get(
    f"{API_URL}/api/portfolios/{portfolio_id}",
    headers=headers
)

portfolio_details = portfolio_response.json()
print(f"Portfolio value: ${portfolio_details['total_value']}")
```

## Next Steps

- [Record Transactions](transaction-management.md)
- [Smart Contract Integration](smart-contract-portfolio.md)
- [Portfolio Analytics](portfolio-analytics.md)
- [Security Monitoring](security-monitoring.md)
