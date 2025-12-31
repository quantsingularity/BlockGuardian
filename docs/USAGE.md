# Usage Guide

This guide covers typical usage patterns for BlockGuardian's CLI tools and library integrations.

## Table of Contents

- [Overview](#overview)
- [Command-Line Usage](#command-line-usage)
- [Library Usage](#library-usage)
- [Common Workflows](#common-workflows)
- [Integration Patterns](#integration-patterns)

## Overview

BlockGuardian can be used in three primary ways:

1. **Web Dashboard**: Visual interface at http://localhost:3000
2. **REST API**: Programmatic access to all features
3. **Python Library**: Direct integration in Python applications

## Command-Line Usage

### Backend Server Management

#### Starting the Backend

```bash
# Development mode (auto-reload enabled)
cd code/backend
source venv/bin/activate
python src/main.py

# Production mode with Gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 src.main:app

# Using environment variable
FLASK_ENV=production python src/main.py
```

#### Checking Server Status

```bash
# Health check
curl http://localhost:5000/health

# API information
curl http://localhost:5000/api/info
```

### Database Operations

#### Initialize Database

```bash
cd code/backend
python src/database/init_db.py
```

#### Database Migrations (if Flask-Migrate is configured)

```bash
# Create migration
flask db migrate -m "Description of changes"

# Apply migrations
flask db upgrade

# Rollback
flask db downgrade
```

### Blockchain Contract Operations

#### Compile Smart Contracts

```bash
cd code/blockchain
npx hardhat compile
```

#### Deploy Contracts

```bash
# Local network
npx hardhat run scripts/deploy.js --network localhost

# Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Mainnet (with caution)
npx hardhat run scripts/deploy.js --network mainnet
```

#### Run Contract Tests

```bash
# All tests
npx hardhat test

# Specific test file
npx hardhat test test/PortfolioManager.test.js

# With coverage
npx hardhat coverage
```

#### Interact with Contracts (Hardhat Console)

```bash
npx hardhat console --network localhost

# In console:
const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
const portfolio = await PortfolioManager.attach("CONTRACT_ADDRESS");
const result = await portfolio.getUserPortfolios("USER_ADDRESS");
console.log(result);
```

### Utility Scripts

#### Setup Environment

```bash
# Full environment setup
./scripts/setup_blockguardian_env.sh

# Verify setup
./scripts/health_check.sh
```

#### Run All Tests

```bash
# Unified test runner
./scripts/run_unified_tests.sh

# Backend tests only
cd code/backend && pytest

# Contract tests only
cd code/blockchain && npx hardhat test

# Frontend tests only
cd web-frontend && npm test
```

#### Code Quality Checks

```bash
# Lint all code
./scripts/lint-all.sh

# Python code quality
cd code/backend
black src/
flake8 src/
mypy src/

# JavaScript/TypeScript linting
cd web-frontend
npm run lint
```

#### Build and Deploy

```bash
# Build all components
./scripts/build_all.sh

# Deploy (automation)
./scripts/deploy_automation.sh

# Clean build artifacts
./scripts/clean_all.sh
```

## Library Usage

### Python Backend Library

#### Authentication Example

```python
from src.security.auth import auth_manager
from src.models.user import User
from flask import Flask

app = Flask(__name__)
auth_manager.init_app(app)

# Register user
user = User(
    email="user@example.com",
    password_hash=auth_manager.hash_password("secure_password"),
    first_name="John",
    last_name="Doe"
)
user.save()

# Authenticate user
token = auth_manager.generate_token(user.id)
print(f"JWT Token: {token}")

# Verify token
payload = auth_manager.verify_token(token)
print(f"User ID: {payload['user_id']}")
```

#### Portfolio Management Example

```python
from src.models.portfolio import Portfolio
from src.models.base import db_manager

# Initialize database session
session = db_manager.get_session()

# Create portfolio
portfolio = Portfolio(
    user_id=user_id,
    name="My Crypto Portfolio",
    description="Long-term investment strategy",
    risk_tolerance="moderate"
)
session.add(portfolio)
session.commit()

# Query portfolios
portfolios = session.query(Portfolio).filter_by(user_id=user_id).all()
for p in portfolios:
    print(f"Portfolio: {p.name}, Balance: ${p.total_value}")

session.close()
```

#### Compliance Check Example

```python
from src.compliance.compliance import ComplianceChecker

# Initialize compliance checker
compliance = ComplianceChecker()

# Perform KYC check
kyc_result = compliance.verify_kyc(
    user_id=user_id,
    document_type="passport",
    document_number="AB123456",
    country="US"
)

# Check transaction for AML
aml_result = compliance.check_aml(
    transaction_id=tx_id,
    amount=10000.00,
    from_address="0x123...",
    to_address="0x456...",
    currency="ETH"
)

if aml_result.risk_level == "high":
    print(f"High risk transaction detected: {aml_result.reason}")
```

#### Monitoring and Metrics Example

```python
from src.monitoring.metrics import MetricsCollector

# Initialize metrics collector
metrics = MetricsCollector()

# Record custom metric
metrics.record_transaction(
    transaction_type="trade",
    amount=5000.00,
    currency="BTC",
    user_id=user_id
)

# Get metrics summary
summary = metrics.get_summary(
    start_date="2025-01-01",
    end_date="2025-12-30",
    metric_type="transactions"
)
print(summary)
```

### Web3/Blockchain Integration

#### Connect to Portfolio Contract

```javascript
// web-frontend/services/blockchain.js
import { ethers } from 'ethers';
import PortfolioManagerABI from './abis/PortfolioManager.json';

// Setup provider
const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);

// Connect to contract
const portfolioContract = new ethers.Contract(
    process.env.NEXT_PUBLIC_PORTFOLIO_CONTRACT_ADDRESS,
    PortfolioManagerABI,
    provider,
);

// Create portfolio
async function createPortfolio(name, description, signer) {
    const contractWithSigner = portfolioContract.connect(signer);
    const tx = await contractWithSigner.createPortfolio(name, description);
    const receipt = await tx.wait();
    console.log('Portfolio created:', receipt);
    return receipt;
}

// Get user portfolios
async function getUserPortfolios(userAddress) {
    const portfolioIds = await portfolioContract.getUserPortfolios(userAddress);
    const portfolios = [];

    for (const id of portfolioIds) {
        const portfolio = await portfolioContract.portfolios(id);
        portfolios.push({
            id: id.toString(),
            name: portfolio.name,
            description: portfolio.description,
            owner: portfolio.owner,
            isActive: portfolio.isActive,
        });
    }

    return portfolios;
}
```

#### React Component Example

```javascript
// web-frontend/components/PortfolioList.jsx
import { useState, useEffect } from 'react';
import { useWallet } from '../hooks/useWallet';
import { getUserPortfolios } from '../services/blockchain';

export default function PortfolioList() {
    const { address, isConnected } = useWallet();
    const [portfolios, setPortfolios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPortfolios() {
            if (isConnected && address) {
                try {
                    const data = await getUserPortfolios(address);
                    setPortfolios(data);
                } catch (error) {
                    console.error('Failed to load portfolios:', error);
                } finally {
                    setLoading(false);
                }
            }
        }

        loadPortfolios();
    }, [address, isConnected]);

    if (loading) return <div>Loading portfolios...</div>;

    return (
        <div className="portfolio-list">
            <h2>My Portfolios</h2>
            {portfolios.map((portfolio) => (
                <div key={portfolio.id} className="portfolio-card">
                    <h3>{portfolio.name}</h3>
                    <p>{portfolio.description}</p>
                    <span>Status: {portfolio.isActive ? 'Active' : 'Inactive'}</span>
                </div>
            ))}
        </div>
    );
}
```

## Common Workflows

### Workflow 1: User Registration and Authentication

```bash
# 1. Start backend server
cd code/backend && python src/main.py

# 2. Register new user (via API)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "first_name": "John",
    "last_name": "Doe"
  }'

# 3. Login to get JWT token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'

# 4. Use token for authenticated requests
TOKEN="eyJhbGc..."  # From login response
curl http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer $TOKEN"
```

### Workflow 2: Creating and Managing Portfolio

```bash
# 1. Create portfolio via API
curl -X POST http://localhost:5000/api/portfolios \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Crypto Growth Portfolio",
    "description": "Aggressive growth strategy",
    "risk_tolerance": "high"
  }'

# 2. Add asset to portfolio
curl -X POST http://localhost:5000/api/portfolios/{portfolio_id}/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "BTC",
    "target_allocation": 0.40,
    "current_amount": 0.5
  }'

# 3. Get portfolio details
curl http://localhost:5000/api/portfolios/{portfolio_id} \
  -H "Authorization: Bearer $TOKEN"
```

### Workflow 3: Smart Contract Deployment and Interaction

```bash
# 1. Start local Ethereum node
cd code/blockchain
npx hardhat node

# 2. Deploy contracts (in new terminal)
npx hardhat run scripts/deploy.js --network localhost

# 3. Copy contract address from output
CONTRACT_ADDRESS="0x5FbDB2315678afecb367f032d93F642f64180aa3"

# 4. Interact with contract
npx hardhat console --network localhost

# In console:
const PortfolioManager = await ethers.getContractFactory("PortfolioManager");
const pm = await PortfolioManager.attach("CONTRACT_ADDRESS");

// Create portfolio
const tx = await pm.createPortfolio("Test Portfolio", "Description");
await tx.wait();
console.log("Portfolio created");

// Get portfolios
const portfolios = await pm.getUserPortfolios(await ethers.provider.getSigner().getAddress());
console.log("User portfolios:", portfolios);
```

### Workflow 4: Running Security Audit

```bash
# 1. Run smart contract security checks
cd code/blockchain
npm install -g slither-analyzer  # If not installed
slither contracts/

# 2. Run backend security scan
cd code/backend
bandit -r src/

# 3. Check dependencies for vulnerabilities
pip audit  # Python
npm audit  # JavaScript

# 4. Generate security report
./scripts/validate_code_quality.py > security_report.txt
```

### Workflow 5: Monitoring and Analytics

```bash
# 1. Start monitoring dashboard
cd web-frontend
npm run dev

# 2. Access monitoring endpoints
curl http://localhost:5000/api/metrics

# 3. View real-time logs
tail -f code/backend/logs/blockguardian.log

# 4. Check Prometheus metrics (if configured)
curl http://localhost:5000/metrics
```

## Integration Patterns

### Pattern 1: Microservice Integration

```python
# External service calling BlockGuardian API
import requests

class BlockGuardianClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })

    def get_portfolio(self, portfolio_id):
        response = self.session.get(
            f'{self.base_url}/api/portfolios/{portfolio_id}'
        )
        response.raise_for_status()
        return response.json()

    def create_transaction(self, portfolio_id, transaction_data):
        response = self.session.post(
            f'{self.base_url}/api/portfolios/{portfolio_id}/transactions',
            json=transaction_data
        )
        response.raise_for_status()
        return response.json()

# Usage
client = BlockGuardianClient('http://localhost:5000', 'your_api_key')
portfolio = client.get_portfolio('12345')
print(portfolio)
```

### Pattern 2: Event-Driven Architecture

```javascript
// Listen for blockchain events
const portfolio = new ethers.Contract(address, abi, provider);

// Subscribe to portfolio creation events
portfolio.on('PortfolioCreated', (portfolioId, owner, name) => {
    console.log(`New portfolio created: ${name} (ID: ${portfolioId})`);

    // Sync with backend
    fetch('http://localhost:5000/api/sync/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            portfolioId: portfolioId.toString(),
            owner,
            name,
        }),
    });
});

// Subscribe to transaction events
portfolio.on('TransactionRecorded', (portfolioId, tokenAddress, amount) => {
    console.log(`Transaction recorded for portfolio ${portfolioId}`);
    // Update analytics, trigger notifications, etc.
});
```

### Pattern 3: Batch Processing

```python
# Process multiple portfolios in batch
from src.models.portfolio import Portfolio
from src.models.base import db_manager

def update_portfolio_valuations(portfolio_ids):
    """Update valuations for multiple portfolios"""
    session = db_manager.get_session()

    portfolios = session.query(Portfolio).filter(
        Portfolio.id.in_(portfolio_ids)
    ).all()

    for portfolio in portfolios:
        # Fetch current prices
        total_value = 0
        for asset in portfolio.assets:
            current_price = fetch_price(asset.symbol)  # External API
            asset_value = asset.amount * current_price
            total_value += asset_value

        # Update portfolio
        portfolio.total_value = total_value
        portfolio.last_updated = datetime.utcnow()

    session.commit()
    session.close()

    return len(portfolios)

# Usage
portfolio_ids = [1, 2, 3, 4, 5]
updated = update_portfolio_valuations(portfolio_ids)
print(f"Updated {updated} portfolios")
```

## Best Practices

1. **Always use HTTPS in production** - Never transmit API keys over HTTP
2. **Implement rate limiting** - Protect your API from abuse
3. **Validate all inputs** - Use provided validation utilities
4. **Handle errors gracefully** - Implement proper error handling
5. **Use environment variables** - Never hardcode secrets
6. **Monitor API usage** - Track metrics and set up alerts
7. **Keep dependencies updated** - Regularly update packages for security

## Next Steps

- **API Details**: See [API Documentation](API.md) for complete endpoint reference
- **CLI Reference**: Check [CLI Guide](CLI.md) for all commands
- **Examples**: Explore [Example Projects](examples/) for more use cases
- **Configuration**: Review [Configuration Guide](CONFIGURATION.md) for advanced setups
