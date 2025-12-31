# Feature Matrix

Complete feature overview and availability across BlockGuardian components.

## Overview

This document provides a comprehensive matrix of all features available in BlockGuardian, including which modules provide them, how to access them, and their current status.

## Core Features

### Authentication & Authorization

| Feature                           | Short description                      | Module / File                       | CLI flag / API                  | Example (path)                                                     | Notes                       |
| --------------------------------- | -------------------------------------- | ----------------------------------- | ------------------------------- | ------------------------------------------------------------------ | --------------------------- |
| User Registration                 | Create new user accounts               | `code/backend/src/routes/auth.py`   | `POST /api/auth/register`       | [examples/auth-registration.md](examples/auth-registration.md)     | Email validation required   |
| User Login                        | Authenticate users with email/password | `code/backend/src/routes/auth.py`   | `POST /api/auth/login`          | [examples/auth-login.md](examples/auth-login.md)                   | Returns JWT tokens          |
| JWT Authentication                | Token-based authentication             | `code/backend/src/security/auth.py` | `Authorization: Bearer <token>` | [examples/api-authentication.md](examples/api-authentication.md)   | Tokens expire after 24h     |
| Token Refresh                     | Refresh expired access tokens          | `code/backend/src/routes/auth.py`   | `POST /api/auth/refresh`        | [examples/auth-token-refresh.md](examples/auth-token-refresh.md)   | Uses refresh token          |
| Multi-Factor Authentication (MFA) | TOTP-based 2FA                         | `code/backend/src/security/auth.py` | `POST /api/auth/mfa/enable`     | [examples/auth-mfa.md](examples/auth-mfa.md)                       | QR code generation          |
| Password Reset                    | Reset forgotten passwords              | `code/backend/src/routes/auth.py`   | `POST /api/auth/reset-password` | [examples/auth-password-reset.md](examples/auth-password-reset.md) | Email verification          |
| Session Management                | Manage user sessions                   | `code/backend/src/security/auth.py` | Automatic                       | N/A                                                                | Redis-backed sessions       |
| Role-Based Access Control         | Permission-based access                | `code/backend/src/security/auth.py` | Decorator `@require_role`       | N/A                                                                | Roles: admin, user, manager |

### Portfolio Management

| Feature             | Short description               | Module / File                                   | CLI flag / API                                  | Example (path)                                                         | Notes                                 |
| ------------------- | ------------------------------- | ----------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------- |
| Create Portfolio    | Create investment portfolios    | `code/backend/src/routes/portfolio.py`          | `POST /api/portfolios`                          | [examples/basic-portfolio.md](examples/basic-portfolio.md)             | Name and risk tolerance required      |
| List Portfolios     | Get user portfolios             | `code/backend/src/routes/portfolio.py`          | `GET /api/portfolios`                           | [examples/basic-portfolio.md](examples/basic-portfolio.md)             | Supports pagination                   |
| Portfolio Details   | Get detailed portfolio info     | `code/backend/src/routes/portfolio.py`          | `GET /api/portfolios/{id}`                      | [examples/basic-portfolio.md](examples/basic-portfolio.md)             | Includes assets and performance       |
| Update Portfolio    | Modify portfolio settings       | `code/backend/src/routes/portfolio.py`          | `PATCH /api/portfolios/{id}`                    | [examples/basic-portfolio.md](examples/basic-portfolio.md)             | Owner/manager only                    |
| Delete Portfolio    | Remove portfolio                | `code/backend/src/routes/portfolio.py`          | `DELETE /api/portfolios/{id}`                   | [examples/basic-portfolio.md](examples/basic-portfolio.md)             | Soft delete                           |
| Add Asset           | Add cryptocurrency to portfolio | `code/backend/src/routes/portfolio.py`          | `POST /api/portfolios/{id}/assets`              | [examples/basic-portfolio.md](examples/basic-portfolio.md)             | Target allocation optional            |
| Remove Asset        | Remove asset from portfolio     | `code/backend/src/routes/portfolio.py`          | `DELETE /api/portfolios/{id}/assets/{asset_id}` | N/A                                                                    | Updates allocations                   |
| Rebalance Portfolio | Rebalance asset allocations     | `code/backend/src/models/portfolio_advanced.py` | `POST /api/portfolios/{id}/rebalance`           | [examples/portfolio-rebalancing.md](examples/portfolio-rebalancing.md) | Automatic calculation                 |
| Portfolio Analytics | Calculate performance metrics   | `code/backend/src/models/portfolio_advanced.py` | `GET /api/portfolios/{id}/analytics`            | [examples/portfolio-analytics.md](examples/portfolio-analytics.md)     | Returns ROI, volatility, Sharpe ratio |

### Smart Contract Features

| Feature               | Short description            | Module / File                                    | CLI flag / API                       | Example (path)                                                               | Notes                         |
| --------------------- | ---------------------------- | ------------------------------------------------ | ------------------------------------ | ---------------------------------------------------------------------------- | ----------------------------- |
| On-Chain Portfolio    | Create blockchain portfolio  | `code/blockchain/contracts/PortfolioManager.sol` | `createPortfolio(name, desc)`        | [examples/smart-contract-portfolio.md](examples/smart-contract-portfolio.md) | Returns portfolio ID          |
| Asset Management      | Add/remove portfolio assets  | `code/blockchain/contracts/PortfolioManager.sol` | `addAsset(id, token, symbol, alloc)` | [examples/smart-contract-portfolio.md](examples/smart-contract-portfolio.md) | Allocation in basis points    |
| Transaction Recording | Record transactions on-chain | `code/blockchain/contracts/PortfolioManager.sol` | `recordTransaction(...)`             | [examples/smart-contract-portfolio.md](examples/smart-contract-portfolio.md) | Immutable transaction log     |
| Portfolio Managers    | Delegate management rights   | `code/blockchain/contracts/PortfolioManager.sol` | `addManager(id, address)`            | N/A                                                                          | Owner can add/remove managers |
| Trading Platform      | Decentralized trading        | `code/blockchain/contracts/TradingPlatform.sol`  | `placeOrder(...)`                    | [examples/smart-contract-trading.md](examples/smart-contract-trading.md)     | Order matching on-chain       |
| Tokenized Assets      | ERC20-based assets           | `code/blockchain/contracts/TokenizedAsset.sol`   | Standard ERC20                       | N/A                                                                          | Mintable, burnable            |
| DeFi Integration      | Connect to DeFi protocols    | `code/blockchain/contracts/DeFiIntegration.sol`  | Various functions                    | [examples/defi-integration.md](examples/defi-integration.md)                 | Uniswap, Aave integration     |

### Transaction Management

| Feature               | Short description              | Module / File                            | CLI flag / API                                    | Example (path)                                                           | Notes                            |
| --------------------- | ------------------------------ | ---------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------- |
| Record Transaction    | Log portfolio transactions     | `code/backend/src/models/transaction.py` | `POST /api/portfolios/{id}/transactions`          | [examples/transaction-management.md](examples/transaction-management.md) | Buy, sell, transfer types        |
| Transaction History   | Query transaction logs         | `code/backend/src/routes/portfolio.py`   | `GET /api/portfolios/{id}/transactions`           | [examples/transaction-management.md](examples/transaction-management.md) | Filterable by date, type, symbol |
| Transaction Export    | Export transactions (CSV, PDF) | `code/backend/src/routes/portfolio.py`   | `GET /api/portfolios/{id}/transactions/export`    | N/A                                                                      | Multiple formats                 |
| Transaction Analytics | Analyze transaction patterns   | `code/backend/src/models/transaction.py` | `GET /api/portfolios/{id}/transactions/analytics` | N/A                                                                      | Volume, frequency, patterns      |

### Compliance & Regulatory

| Feature              | Short description               | Module / File                               | CLI flag / API                   | Example (path)                                                       | Notes                              |
| -------------------- | ------------------------------- | ------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- | ---------------------------------- |
| KYC Verification     | Know Your Customer verification | `code/backend/src/compliance/compliance.py` | `POST /api/compliance/kyc`       | [examples/compliance-kyc.md](examples/compliance-kyc.md)             | Document upload required           |
| AML Screening        | Anti-Money Laundering checks    | `code/backend/src/compliance/compliance.py` | `POST /api/compliance/aml/check` | [examples/compliance-aml.md](examples/compliance-aml.md)             | Automatic transaction screening    |
| Audit Logging        | Immutable audit trails          | `code/backend/src/security/audit.py`        | Automatic                        | N/A                                                                  | All actions logged                 |
| Compliance Reporting | Generate compliance reports     | `code/backend/src/compliance/reporting.py`  | `GET /api/compliance/reports`    | [examples/compliance-reporting.md](examples/compliance-reporting.md) | PDF, CSV formats                   |
| GDPR Compliance      | Data privacy compliance         | `code/backend/src/compliance/compliance.py` | Various endpoints                | N/A                                                                  | Right to erasure, data portability |
| Transaction Limits   | Enforce regulatory limits       | `code/backend/src/compliance/compliance.py` | Automatic                        | N/A                                                                  | Daily, monthly limits              |
| Sanctions Screening  | Check against sanctions lists   | `code/backend/src/compliance/compliance.py` | Automatic                        | N/A                                                                  | OFAC, UN, EU lists                 |

### Security Features

| Feature                  | Short description       | Module / File                                | CLI flag / API        | Example (path)                                                       | Notes                         |
| ------------------------ | ----------------------- | -------------------------------------------- | --------------------- | -------------------------------------------------------------------- | ----------------------------- |
| Rate Limiting            | Prevent API abuse       | `code/backend/src/security/rate_limiting.py` | Automatic             | N/A                                                                  | Redis-backed                  |
| Input Validation         | Sanitize user inputs    | `code/backend/src/security/validation.py`    | Automatic             | N/A                                                                  | SQL injection, XSS prevention |
| Data Encryption          | Encrypt sensitive data  | `code/backend/src/security/encryption.py`    | Automatic             | N/A                                                                  | AES-256 encryption            |
| Password Hashing         | Secure password storage | `code/backend/src/security/auth.py`          | Automatic             | N/A                                                                  | Bcrypt with 12 rounds         |
| CORS Protection          | Cross-origin security   | `code/backend/src/main.py`                   | Config `CORS_ORIGINS` | N/A                                                                  | Configurable origins          |
| CSRF Protection          | Prevent CSRF attacks    | `code/backend/src/security/auth.py`          | Automatic             | N/A                                                                  | Token-based                   |
| SQL Injection Prevention | Prevent SQL attacks     | `code/backend/src/models/base.py`            | Automatic             | N/A                                                                  | SQLAlchemy ORM                |
| Smart Contract Audit     | Security scanning       | `code/blockchain/contracts/`                 | `slither contracts/`  | [examples/smart-contract-audit.md](examples/smart-contract-audit.md) | Slither, Mythril              |

### Monitoring & Analytics

| Feature              | Short description           | Module / File                                   | CLI flag / API                     | Example (path)                                                     | Notes                   |
| -------------------- | --------------------------- | ----------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ | ----------------------- |
| Real-time Monitoring | Live transaction monitoring | `code/backend/src/monitoring/metrics.py`        | WebSocket `/ws/monitor`            | [examples/security-monitoring.md](examples/security-monitoring.md) | WebSocket connection    |
| Anomaly Detection    | AI-powered threat detection | `code/backend/src/models/ai_models.py`          | Automatic                          | [examples/security-monitoring.md](examples/security-monitoring.md) | ML-based detection      |
| Performance Metrics  | Track portfolio performance | `code/backend/src/models/portfolio_advanced.py` | `GET /api/portfolios/{id}/metrics` | [examples/portfolio-analytics.md](examples/portfolio-analytics.md) | ROI, volatility, Sharpe |
| Risk Assessment      | Calculate portfolio risk    | `code/backend/src/models/portfolio_advanced.py` | `GET /api/portfolios/{id}/risk`    | [examples/risk-assessment.md](examples/risk-assessment.md)         | VaR, CVaR calculations  |
| Health Monitoring    | System health checks        | `code/backend/src/main.py`                      | `GET /health`                      | N/A                                                                | Database, Redis status  |
| Prometheus Metrics   | Metrics for monitoring      | `code/backend/src/monitoring/metrics.py`        | `GET /metrics`                     | N/A                                                                | Prometheus format       |
| Dashboard Analytics  | Visual analytics            | `web-frontend/pages/dashboard.jsx`              | Web UI                             | N/A                                                                | Charts, graphs, KPIs    |

### Data Analysis

| Feature                | Short description            | Module / File                          | CLI flag / API                | Example (path)                                                           | Notes                    |
| ---------------------- | ---------------------------- | -------------------------------------- | ----------------------------- | ------------------------------------------------------------------------ | ------------------------ |
| Market Data Analysis   | Analyze market trends        | `code/data-analysis/notebooks/`        | Jupyter notebooks             | [examples/market-analysis.md](examples/market-analysis.md)               | pandas, matplotlib       |
| Portfolio Optimization | Optimize asset allocation    | `code/data-analysis/scripts/`          | Python scripts                | [examples/portfolio-optimization.md](examples/portfolio-optimization.md) | Modern portfolio theory  |
| Risk Modeling          | Model portfolio risk         | `code/data-analysis/scripts/`          | Python scripts                | [examples/risk-modeling.md](examples/risk-modeling.md)                   | VaR, Monte Carlo         |
| Backtesting            | Test strategies historically | `code/data-analysis/scripts/`          | Python scripts                | [examples/backtesting.md](examples/backtesting.md)                       | Historical data analysis |
| ML Predictions         | Price prediction models      | `code/backend/src/models/ai_models.py` | `POST /api/analytics/predict` | [examples/ml-predictions.md](examples/ml-predictions.md)                 | TensorFlow, PyTorch      |

### User Interface Features

| Feature             | Short description       | Module / File                            | CLI flag / API  | Example (path) | Notes                          |
| ------------------- | ----------------------- | ---------------------------------------- | --------------- | -------------- | ------------------------------ |
| Web Dashboard       | Browser-based interface | `web-frontend/pages/`                    | Web UI at :3000 | N/A            | React + Next.js                |
| Mobile App          | iOS/Android application | `mobile-frontend/`                       | Mobile app      | N/A            | React Native                   |
| Portfolio View      | View portfolio details  | `web-frontend/pages/portfolios/[id].jsx` | Web UI          | N/A            | Real-time updates              |
| Trading Interface   | Execute trades          | `web-frontend/pages/trade.jsx`           | Web UI          | N/A            | Limit, market orders           |
| Analytics Dashboard | View charts and metrics | `web-frontend/pages/analytics.jsx`       | Web UI          | N/A            | D3.js visualizations           |
| Settings Panel      | Configure user settings | `web-frontend/pages/settings.jsx`        | Web UI          | N/A            | Profile, security, preferences |
| Wallet Integration  | Connect Web3 wallets    | `web-frontend/services/wallet.js`        | Web UI          | N/A            | MetaMask, WalletConnect        |

### Integration Features

| Feature         | Short description        | Module / File                         | CLI flag / API            | Example (path)                               | Notes                        |
| --------------- | ------------------------ | ------------------------------------- | ------------------------- | -------------------------------------------- | ---------------------------- |
| REST API        | HTTP API endpoints       | `code/backend/src/routes/`            | Various endpoints         | [API.md](API.md)                             | JSON responses               |
| WebSocket API   | Real-time communication  | `code/backend/src/main.py`            | `ws://localhost:5000/ws`  | N/A                                          | Socket.IO                    |
| Webhook Support | Event notifications      | `code/backend/src/routes/webhooks.py` | `POST /api/webhooks`      | [examples/webhooks.md](examples/webhooks.md) | Configurable callbacks       |
| External APIs   | Third-party integrations | `code/backend/src/`                   | Various                   | N/A                                          | CoinMarketCap, Alpha Vantage |
| Blockchain RPC  | Ethereum node connection | `code/backend/src/`                   | Config `ETHEREUM_RPC_URL` | N/A                                          | Infura, Alchemy              |

## Feature Status

### Legend

- ✅ **Stable**: Fully implemented and tested
- 🚧 **Beta**: Implemented but under active development
- 📝 **Planned**: Scheduled for future release
- ⚠️ **Experimental**: Available but may change

### Component Availability

| Component            | Backend API | Web UI | Mobile UI | Smart Contracts | Status          |
| -------------------- | ----------- | ------ | --------- | --------------- | --------------- |
| User Registration    | ✅          | ✅     | ✅        | N/A             | ✅ Stable       |
| User Login           | ✅          | ✅     | ✅        | N/A             | ✅ Stable       |
| MFA                  | ✅          | ✅     | 🚧        | N/A             | 🚧 Beta         |
| Portfolio Creation   | ✅          | ✅     | ✅        | ✅              | ✅ Stable       |
| Portfolio Management | ✅          | ✅     | ✅        | ✅              | ✅ Stable       |
| Asset Trading        | ✅          | ✅     | 🚧        | ✅              | 🚧 Beta         |
| KYC Verification     | ✅          | ✅     | 📝        | N/A             | 🚧 Beta         |
| AML Screening        | ✅          | N/A    | N/A       | N/A             | ✅ Stable       |
| Real-time Monitoring | ✅          | ✅     | 📝        | N/A             | 🚧 Beta         |
| Anomaly Detection    | ✅          | ✅     | 📝        | N/A             | ⚠️ Experimental |
| Portfolio Analytics  | ✅          | ✅     | ✅        | N/A             | ✅ Stable       |
| Risk Assessment      | ✅          | ✅     | 🚧        | N/A             | 🚧 Beta         |
| Compliance Reporting | ✅          | ✅     | 📝        | N/A             | ✅ Stable       |
| DeFi Integration     | 🚧          | 📝     | 📝        | ✅              | ⚠️ Experimental |
| ML Predictions       | 🚧          | 📝     | 📝        | N/A             | ⚠️ Experimental |

## Version History

### v1.0.0 (Current)

**New Features:**

- Multi-Factor Authentication (MFA)
- On-chain portfolio management smart contracts
- Advanced compliance reporting
- Real-time monitoring dashboard
- AI-powered anomaly detection
- Portfolio risk assessment
- WebSocket support for real-time updates

**Improvements:**

- Enhanced security with rate limiting
- Improved API performance
- Better error handling
- Updated dependencies

### v0.9.0 (Beta)

**Features:**

- Basic portfolio management
- User authentication and authorization
- Smart contract deployment
- Web dashboard
- Mobile app MVP

## Feature Dependencies

### Prerequisites by Feature

| Feature              | Requires             | Notes                     |
| -------------------- | -------------------- | ------------------------- |
| Portfolio Management | User Authentication  | Must be logged in         |
| Trading              | Portfolio, KYC       | KYC verification required |
| MFA                  | User Account         | Can be enabled anytime    |
| On-chain Portfolio   | Wallet Connection    | Ethereum wallet required  |
| Compliance Reporting | KYC, Transactions    | Historical data needed    |
| Anomaly Detection    | Real-time Monitoring | ML models required        |
| Risk Assessment      | Portfolio Data       | Minimum 30 days history   |

## Configuration by Feature

| Feature       | Configuration              | Default | Notes                       |
| ------------- | -------------------------- | ------- | --------------------------- |
| MFA           | `MFA_ENABLED`              | `True`  | Can disable per environment |
| Rate Limiting | `RATE_LIMIT_PER_MINUTE`    | `100`   | Per user                    |
| KYC           | `KYC_ENABLED`              | `True`  | Required for trading        |
| AML           | `AML_ENABLED`              | `True`  | Compliance requirement      |
| Monitoring    | `METRICS_ENABLED`          | `True`  | Prometheus metrics          |
| Audit Logging | `AUDIT_LOG_RETENTION_DAYS` | `2555`  | 7 years retention           |

## Next Steps

- Review [API Documentation](API.md) for detailed endpoint information
- Check [Examples](examples/) for feature usage examples
- See [Configuration](CONFIGURATION.md) for feature configuration options
- Read [Architecture](ARCHITECTURE.md) for system design details
