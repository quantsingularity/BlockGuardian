# Configuration Guide

Complete configuration reference for BlockGuardian components.

## Table of Contents

- [Overview](#overview)
- [Backend Configuration](#backend-configuration)
- [Frontend Configuration](#frontend-configuration)
- [Blockchain Configuration](#blockchain-configuration)
- [Infrastructure Configuration](#infrastructure-configuration)
- [Environment-Specific Settings](#environment-specific-settings)

## Overview

BlockGuardian uses environment variables and configuration files to manage settings across different components and environments.

### Configuration File Locations

| Component       | Configuration File   | Location                  |
| --------------- | -------------------- | ------------------------- |
| Backend         | `.env`               | `code/backend/.env`       |
| Web Frontend    | `.env.local`         | `web-frontend/.env.local` |
| Mobile Frontend | `.env`               | `mobile-frontend/.env`    |
| Blockchain      | `.env`               | `code/blockchain/.env`    |
| Docker          | `docker-compose.yml` | `./docker-compose.yml`    |

## Backend Configuration

### Environment Variables

Configure backend by creating `code/backend/.env`:

```bash
# Application Settings
FLASK_ENV=development              # development, production, testing
FLASK_DEBUG=True                   # Enable debug mode (development only)
SECRET_KEY=your-secret-key-here    # Application secret (generate securely)
API_VERSION=1.0.0                  # API version

# Server Configuration
HOST=0.0.0.0                       # Server host
PORT=5000                          # Server port
WORKERS=4                          # Gunicorn worker count (production)

# Database Configuration
DATABASE_URL=sqlite:///database/app.db  # SQLite (development)
# DATABASE_URL=postgresql://user:password@localhost:5432/blockguardian  # PostgreSQL (production)
DATABASE_POOL_SIZE=20              # Connection pool size
DATABASE_MAX_OVERFLOW=30           # Max overflow connections
DATABASE_POOL_TIMEOUT=30           # Pool timeout (seconds)
DATABASE_POOL_RECYCLE=3600         # Connection recycle time

# Redis Configuration
REDIS_URL=redis://localhost:6379/0  # Redis connection URL
REDIS_MAX_CONNECTIONS=50           # Max Redis connections
REDIS_SOCKET_TIMEOUT=30            # Socket timeout (seconds)

# JWT Authentication
JWT_SECRET_KEY=your-jwt-secret     # JWT signing key (different from SECRET_KEY)
JWT_ACCESS_TOKEN_EXPIRES=86400     # Access token expiry (seconds, 24 hours)
JWT_REFRESH_TOKEN_EXPIRES=2592000  # Refresh token expiry (seconds, 30 days)
JWT_ALGORITHM=HS256                # JWT algorithm

# Security Settings
PASSWORD_HASH_ROUNDS=12            # Bcrypt rounds
MAX_LOGIN_ATTEMPTS=5               # Max failed login attempts
LOCKOUT_DURATION=1800              # Account lockout duration (seconds, 30 minutes)
SESSION_TIMEOUT=28800              # Session timeout (seconds, 8 hours)
ENCRYPTION_KEY=your-encryption-key # Data encryption key (32 bytes, base64)

# CORS Settings
CORS_ORIGINS=http://localhost:3000,http://localhost:19006  # Allowed origins
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS  # Allowed methods
CORS_ALLOW_HEADERS=Content-Type,Authorization  # Allowed headers

# Rate Limiting
RATE_LIMIT_ENABLED=True            # Enable rate limiting
RATE_LIMIT_PER_MINUTE=100          # Requests per minute (authenticated)
RATE_LIMIT_BURST=150               # Burst limit
RATE_LIMIT_STORAGE=redis           # Storage backend (redis or memory)

# External APIs
INFURA_API_KEY=your-infura-key     # Infura for Ethereum
ETHERSCAN_API_KEY=your-etherscan-key  # Etherscan for verification
COINMARKETCAP_API_KEY=your-cmc-key    # CoinMarketCap for prices
ALPHA_VANTAGE_API_KEY=your-av-key     # Alpha Vantage for financial data
POLYGON_API_KEY=your-polygon-key       # Polygon for market data

# Blockchain Networks
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
ETHEREUM_WS_URL=wss://mainnet.infura.io/ws/v3/YOUR_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_KEY

# Contract Addresses (update after deployment)
PORTFOLIO_MANAGER_ADDRESS=0x0000000000000000000000000000000000000000
TRADING_PLATFORM_ADDRESS=0x0000000000000000000000000000000000000000
TOKENIZED_ASSET_ADDRESS=0x0000000000000000000000000000000000000000

# Compliance
KYC_ENABLED=True                   # Enable KYC verification
AML_ENABLED=True                   # Enable AML checks
AUDIT_LOG_RETENTION_DAYS=2555      # Audit log retention (7 years)
TRANSACTION_REPORTING_ENABLED=True # Enable transaction reporting
GDPR_COMPLIANCE=True               # GDPR compliance mode

# Monitoring
LOG_LEVEL=INFO                     # Logging level (DEBUG, INFO, WARNING, ERROR)
LOG_FORMAT=json                    # Log format (json or text)
METRICS_ENABLED=True               # Enable Prometheus metrics
TRACING_ENABLED=True               # Enable distributed tracing
HEALTH_CHECK_INTERVAL=30           # Health check interval (seconds)
SENTRY_DSN=                        # Sentry DSN for error tracking

# Email (for notifications)
MAIL_SERVER=smtp.gmail.com         # SMTP server
MAIL_PORT=587                      # SMTP port
MAIL_USE_TLS=True                  # Use TLS
MAIL_USERNAME=your-email@gmail.com # SMTP username
MAIL_PASSWORD=your-password        # SMTP password
MAIL_DEFAULT_SENDER=noreply@blockguardian.com  # Default sender

# File Storage
UPLOAD_FOLDER=uploads              # Upload directory
MAX_CONTENT_LENGTH=5242880         # Max upload size (5MB)
ALLOWED_EXTENSIONS=jpg,jpeg,png,pdf  # Allowed file extensions

# Background Jobs
CELERY_BROKER_URL=redis://localhost:6379/0  # Celery broker
CELERY_RESULT_BACKEND=redis://localhost:6379/0  # Result backend
CELERY_TASK_SERIALIZER=json        # Task serializer
CELERY_RESULT_SERIALIZER=json      # Result serializer
```

### Configuration Options Reference

#### Database Settings

| Option                  | Type    | Default                     | Description                       | Where to set |
| ----------------------- | ------- | --------------------------- | --------------------------------- | ------------ |
| `DATABASE_URL`          | string  | `sqlite:///database/app.db` | Database connection string        | env file     |
| `DATABASE_POOL_SIZE`    | integer | 20                          | Connection pool size              | env file     |
| `DATABASE_MAX_OVERFLOW` | integer | 30                          | Max overflow connections          | env file     |
| `DATABASE_POOL_TIMEOUT` | integer | 30                          | Connection timeout (seconds)      | env file     |
| `DATABASE_POOL_RECYCLE` | integer | 3600                        | Connection recycle time (seconds) | env file     |
| `DATABASE_ECHO`         | boolean | False                       | Log SQL queries                   | env file     |

#### Security Settings

| Option                      | Type    | Default  | Description                            | Where to set |
| --------------------------- | ------- | -------- | -------------------------------------- | ------------ |
| `SECRET_KEY`                | string  | Required | Application secret key                 | env file     |
| `JWT_SECRET_KEY`            | string  | Required | JWT signing key                        | env file     |
| `JWT_ACCESS_TOKEN_EXPIRES`  | integer | 86400    | Access token TTL (seconds)             | env file     |
| `JWT_REFRESH_TOKEN_EXPIRES` | integer | 2592000  | Refresh token TTL (seconds)            | env file     |
| `PASSWORD_HASH_ROUNDS`      | integer | 12       | Bcrypt rounds                          | env file     |
| `MAX_LOGIN_ATTEMPTS`        | integer | 5        | Max failed login attempts              | env file     |
| `LOCKOUT_DURATION`          | integer | 1800     | Lockout duration (seconds)             | env file     |
| `ENCRYPTION_KEY`            | string  | Required | Data encryption key (32 bytes, base64) | env file     |

#### Rate Limiting Settings

| Option                  | Type    | Default | Description            | Where to set |
| ----------------------- | ------- | ------- | ---------------------- | ------------ |
| `RATE_LIMIT_ENABLED`    | boolean | True    | Enable rate limiting   | env file     |
| `RATE_LIMIT_PER_MINUTE` | integer | 100     | Requests per minute    | env file     |
| `RATE_LIMIT_BURST`      | integer | 150     | Burst requests allowed | env file     |
| `RATE_LIMIT_STORAGE`    | string  | `redis` | Storage backend        | env file     |

#### Compliance Settings

| Option                          | Type    | Default | Description                  | Where to set |
| ------------------------------- | ------- | ------- | ---------------------------- | ------------ |
| `KYC_ENABLED`                   | boolean | True    | Enable KYC verification      | env file     |
| `AML_ENABLED`                   | boolean | True    | Enable AML checks            | env file     |
| `AUDIT_LOG_RETENTION_DAYS`      | integer | 2555    | Audit log retention (days)   | env file     |
| `TRANSACTION_REPORTING_ENABLED` | boolean | True    | Enable transaction reporting | env file     |
| `GDPR_COMPLIANCE`               | boolean | True    | GDPR compliance mode         | env file     |

## Frontend Configuration

### Web Frontend (.env.local)

Configure web frontend by creating `web-frontend/.env.local`:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000  # Backend API URL
NEXT_PUBLIC_API_VERSION=v1                 # API version
NEXT_PUBLIC_API_TIMEOUT=30000              # Request timeout (ms)

# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=1                     # Chain ID (1=mainnet, 11155111=sepolia)
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY
NEXT_PUBLIC_WS_URL=wss://mainnet.infura.io/ws/v3/YOUR_KEY

# Contract Addresses
NEXT_PUBLIC_PORTFOLIO_CONTRACT=0x0000000000000000000000000000000000000000
NEXT_PUBLIC_TRADING_CONTRACT=0x0000000000000000000000000000000000000000

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # Google Analytics
NEXT_PUBLIC_SENTRY_DSN=                     # Sentry DSN

# Feature Flags
NEXT_PUBLIC_ENABLE_MFA=true                # Enable MFA feature
NEXT_PUBLIC_ENABLE_TRADING=true            # Enable trading feature
NEXT_PUBLIC_ENABLE_ANALYTICS=true          # Enable analytics

# Environment
NEXT_PUBLIC_ENVIRONMENT=development        # development, staging, production
```

### Mobile Frontend (.env)

Configure mobile frontend by creating `mobile-frontend/.env`:

```bash
# API Configuration
API_URL=http://localhost:5000              # Backend API URL (use 10.0.2.2 for Android emulator)
API_TIMEOUT=30000                          # Request timeout (ms)

# Blockchain Configuration
CHAIN_ID=1                                 # Chain ID
RPC_URL=https://mainnet.infura.io/v3/YOUR_KEY

# Contract Addresses
PORTFOLIO_CONTRACT=0x0000000000000000000000000000000000000000
TRADING_CONTRACT=0x0000000000000000000000000000000000000000

# WalletConnect
WALLETCONNECT_PROJECT_ID=your-project-id

# Environment
ENVIRONMENT=development
```

### Frontend Configuration Options

| Option                           | Type    | Default                 | Description                | Where to set |
| -------------------------------- | ------- | ----------------------- | -------------------------- | ------------ |
| `NEXT_PUBLIC_API_URL`            | string  | `http://localhost:5000` | Backend API URL            | env.local    |
| `NEXT_PUBLIC_CHAIN_ID`           | integer | 1                       | Ethereum chain ID          | env.local    |
| `NEXT_PUBLIC_RPC_URL`            | string  | Required                | Ethereum RPC endpoint      | env.local    |
| `NEXT_PUBLIC_PORTFOLIO_CONTRACT` | string  | Required                | Portfolio contract address | env.local    |
| `NEXT_PUBLIC_ENABLE_MFA`         | boolean | true                    | Enable MFA feature         | env.local    |

## Blockchain Configuration

### Hardhat Configuration (.env)

Configure blockchain development by creating `code/blockchain/.env`:

```bash
# Network RPC URLs
MAINNET_RPC_URL=https://mainnet.infura.io/v3/YOUR_INFURA_KEY
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
GOERLI_RPC_URL=https://goerli.infura.io/v3/YOUR_INFURA_KEY
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/YOUR_INFURA_KEY
MUMBAI_RPC_URL=https://polygon-mumbai.infura.io/v3/YOUR_INFURA_KEY

# Private Keys (NEVER commit real keys!)
DEPLOYER_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
TESTNET_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# API Keys
ETHERSCAN_API_KEY=your-etherscan-api-key   # For contract verification
POLYGONSCAN_API_KEY=your-polygonscan-key   # For Polygon verification
COINMARKETCAP_API_KEY=your-cmc-key         # For gas reporting

# Gas Configuration
GAS_LIMIT=5000000                          # Default gas limit
GAS_PRICE_GWEI=20                          # Gas price in gwei
MAX_FEE_PER_GAS_GWEI=50                    # Max fee per gas (EIP-1559)
MAX_PRIORITY_FEE_PER_GAS_GWEI=2            # Max priority fee (EIP-1559)

# Deployment
NETWORK=localhost                          # Default network for deployment
CONFIRMATION_BLOCKS=12                     # Confirmations to wait

# Debugging
DEBUG=false                                # Enable debug output
VERBOSE=false                              # Verbose logging
```

### Hardhat Network Configuration

Edit `code/blockchain/hardhat.config.js` for network settings:

```javascript
module.exports = {
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.TESTNET_PRIVATE_KEY],
      chainId: 11155111,
      gasPrice: 20000000000,
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
      chainId: 1,
      gasPrice: 50000000000,
    },
  },
};
```

### Blockchain Configuration Options

| Option                 | Type    | Default  | Description          | Where to set |
| ---------------------- | ------- | -------- | -------------------- | ------------ |
| `MAINNET_RPC_URL`      | string  | Required | Ethereum mainnet RPC | env file     |
| `SEPOLIA_RPC_URL`      | string  | Required | Sepolia testnet RPC  | env file     |
| `DEPLOYER_PRIVATE_KEY` | string  | Required | Deployer private key | env file     |
| `ETHERSCAN_API_KEY`    | string  | Required | Etherscan API key    | env file     |
| `GAS_LIMIT`            | integer | 5000000  | Default gas limit    | env file     |
| `GAS_PRICE_GWEI`       | integer | 20       | Gas price in gwei    | env file     |

## Infrastructure Configuration

### Docker Compose Configuration

Edit `docker-compose.yml` for service configuration:

```yaml
version: "3.8"

services:
  backend:
    build:
      context: ./code/backend
      dockerfile: Dockerfile
    container_name: blockguardian_backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/blockguardian
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - ./code/backend:/app
    networks:
      - blockguardian_net

  web_frontend:
    build:
      context: ./web-frontend
      dockerfile: Dockerfile
    container_name: blockguardian_web_frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
    depends_on:
      - backend
    volumes:
      - ./web-frontend:/app
      - /app/node_modules
    networks:
      - blockguardian_net

  db:
    image: postgres:15-alpine
    container_name: blockguardian_db
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=blockguardian
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - blockguardian_net

  redis:
    image: redis:7-alpine
    container_name: blockguardian_redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - blockguardian_net

networks:
  blockguardian_net:
    driver: bridge

volumes:
  postgres_data:
  redis_data:
```

### Kubernetes Configuration

Example Kubernetes deployment configuration (`infrastructure/kubernetes/base/backend-deployment.yaml`):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: blockguardian-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: blockguardian-backend
  template:
    metadata:
      labels:
        app: blockguardian-backend
    spec:
      containers:
        - name: backend
          image: blockguardian/backend:latest
          ports:
            - containerPort: 5000
          env:
            - name: FLASK_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: blockguardian-secrets
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                configMapKeyRef:
                  name: blockguardian-config
                  key: redis-url
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
```

## Environment-Specific Settings

### Development Environment

**Characteristics:**

- Debug mode enabled
- SQLite database
- No HTTPS required
- Detailed error messages
- Hot reload enabled

**Configuration:**

```bash
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=sqlite:///database/app.db
LOG_LEVEL=DEBUG
```

### Staging Environment

**Characteristics:**

- Production-like setup
- PostgreSQL database
- HTTPS required
- Limited error details
- Performance monitoring

**Configuration:**

```bash
FLASK_ENV=staging
FLASK_DEBUG=False
DATABASE_URL=postgresql://user:pass@db-staging/blockguardian
LOG_LEVEL=INFO
METRICS_ENABLED=True
```

### Production Environment

**Characteristics:**

- Maximum security
- PostgreSQL database with replication
- HTTPS enforced
- Minimal error details
- Full monitoring and alerting

**Configuration:**

```bash
FLASK_ENV=production
FLASK_DEBUG=False
DATABASE_URL=postgresql://user:pass@db-prod/blockguardian
LOG_LEVEL=WARNING
METRICS_ENABLED=True
TRACING_ENABLED=True
SENTRY_DSN=your-sentry-dsn
```

## Security Best Practices

1. **Never commit secrets**: Use `.env` files (add to `.gitignore`)
2. **Use strong keys**: Generate cryptographically secure random keys
3. **Rotate keys regularly**: Implement key rotation policy
4. **Separate environments**: Different keys for dev/staging/prod
5. **Encrypt sensitive data**: Use encryption for sensitive configuration
6. **Limit access**: Restrict who can view production configs
7. **Use secrets management**: Consider HashiCorp Vault or AWS Secrets Manager
8. **Audit configuration**: Log configuration changes

## Configuration Validation

BlockGuardian includes configuration validation on startup:

```bash
# Validate backend configuration
cd code/backend
python -c "from src.config import validate_config; validate_config()"

# Validate frontend configuration
cd web-frontend
npm run validate-config
```

## Troubleshooting Configuration

| Issue                        | Solution                                             |
| ---------------------------- | ---------------------------------------------------- |
| `SECRET_KEY not set`         | Generate and set `SECRET_KEY` in `.env`              |
| `Database connection failed` | Check `DATABASE_URL` format and credentials          |
| `Redis connection failed`    | Verify Redis is running and `REDIS_URL` is correct   |
| `JWT token invalid`          | Ensure `JWT_SECRET_KEY` is set and consistent        |
| `CORS errors`                | Add frontend URL to `CORS_ORIGINS`                   |
| `Contract not found`         | Update contract addresses in `.env` after deployment |

## Next Steps

- Review [API Documentation](API.md) for endpoint-specific configuration
- Check [Troubleshooting Guide](TROUBLESHOOTING.md) for common issues
- See [Architecture](ARCHITECTURE.md) for system design details
