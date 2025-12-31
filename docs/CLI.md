# CLI Reference

Command-line interface documentation for BlockGuardian scripts and utilities.

## Table of Contents

- [Overview](#overview)
- [Environment Management](#environment-management)
- [Backend Commands](#backend-commands)
- [Blockchain Commands](#blockchain-commands)
- [Utility Scripts](#utility-scripts)
- [Testing Commands](#testing-commands)
- [Deployment Commands](#deployment-commands)

## Overview

BlockGuardian provides several CLI scripts for managing the platform. All scripts are located in the `scripts/` directory.

## Environment Management

### setup_blockguardian_env.sh

Sets up the complete development environment.

**Command:**

| Command                                | Arguments | Description            | Example                                |
| -------------------------------------- | --------- | ---------------------- | -------------------------------------- |
| `./scripts/setup_blockguardian_env.sh` | None      | Setup full environment | `./scripts/setup_blockguardian_env.sh` |

**What it does:**

- Checks system prerequisites (Python, Node.js, Docker)
- Creates Python virtual environments
- Installs backend dependencies
- Installs frontend dependencies
- Sets up blockchain development environment
- Creates default configuration files
- Initializes databases

**Example:**

```bash
cd BlockGuardian
./scripts/setup_blockguardian_env.sh
```

**Output:**

```
🔧 BlockGuardian Environment Setup
==================================
✓ Checking Python installation... Found Python 3.9.7
✓ Checking Node.js installation... Found Node v18.12.0
✓ Checking Docker installation... Found Docker 20.10.21
✓ Setting up backend environment...
✓ Installing backend dependencies...
✓ Setting up frontend environment...
✓ Installing frontend dependencies...
✓ Setting up blockchain environment...
✓ Creating configuration files...
✓ Initializing databases...

✅ Setup complete! Run ./scripts/run_blockguardian.sh to start.
```

### run_blockguardian.sh

Starts all BlockGuardian services.

**Command:**

| Command                                         | Arguments        | Description               | Example                                         |
| ----------------------------------------------- | ---------------- | ------------------------- | ----------------------------------------------- |
| `./scripts/run_blockguardian.sh`                | None             | Start all services        | `./scripts/run_blockguardian.sh`                |
| `./scripts/run_blockguardian.sh --docker`       | `--docker`       | Start with Docker Compose | `./scripts/run_blockguardian.sh --docker`       |
| `./scripts/run_blockguardian.sh --backend-only` | `--backend-only` | Start backend only        | `./scripts/run_blockguardian.sh --backend-only` |

**Example:**

```bash
# Start all services
./scripts/run_blockguardian.sh

# Start with Docker
./scripts/run_blockguardian.sh --docker

# Start backend only
./scripts/run_blockguardian.sh --backend-only
```

**Output:**

```
🚀 Starting BlockGuardian Services
=================================
Starting backend API... ✓ (http://localhost:5000)
Starting web frontend... ✓ (http://localhost:3000)
Starting blockchain node... ✓ (http://localhost:8545)

✅ All services running!
   Backend: http://localhost:5000
   Frontend: http://localhost:3000
   Blockchain: http://localhost:8545

Press Ctrl+C to stop all services.
```

### health_check.sh

Checks the health status of all services.

**Command:**

| Command                               | Arguments   | Description        | Example                               |
| ------------------------------------- | ----------- | ------------------ | ------------------------------------- |
| `./scripts/health_check.sh`           | None        | Check all services | `./scripts/health_check.sh`           |
| `./scripts/health_check.sh --verbose` | `--verbose` | Detailed output    | `./scripts/health_check.sh --verbose` |

**Example:**

```bash
./scripts/health_check.sh
```

**Output:**

```
🏥 BlockGuardian Health Check
============================
Backend API (http://localhost:5000)... ✓ Healthy
Web Frontend (http://localhost:3000)... ✓ Running
Database (PostgreSQL)... ✓ Connected
Redis Cache... ✓ Connected
Blockchain Node... ✓ Synced

✅ All systems operational
```

## Backend Commands

### Running Backend Server

**Command:**

| Command                 | Arguments                     | Description              | Example                                      |
| ----------------------- | ----------------------------- | ------------------------ | -------------------------------------------- |
| `python src/main.py`    | None                          | Start development server | `cd code/backend && python src/main.py`      |
| `gunicorn src.main:app` | `-w <workers> -b <host:port>` | Start production server  | `gunicorn -w 4 -b 0.0.0.0:5000 src.main:app` |

**Development Server:**

```bash
cd code/backend
source venv/bin/activate
python src/main.py
```

**Production Server:**

```bash
cd code/backend
source venv/bin/activate
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 src.main:app
```

**Environment Variables:**

| Variable       | Description         | Default       | Example                               |
| -------------- | ------------------- | ------------- | ------------------------------------- |
| `FLASK_ENV`    | Environment mode    | `development` | `production`                          |
| `FLASK_DEBUG`  | Debug mode          | `True`        | `False`                               |
| `DATABASE_URL` | Database connection | SQLite        | `postgresql://user:pass@localhost/db` |
| `REDIS_URL`    | Redis connection    | `None`        | `redis://localhost:6379/0`            |
| `SECRET_KEY`   | Application secret  | Generated     | `your-secret-key`                     |

### Database Initialization

**Command:**

| Command                          | Arguments | Description         | Example                                             |
| -------------------------------- | --------- | ------------------- | --------------------------------------------------- |
| `python src/database/init_db.py` | None      | Initialize database | `cd code/backend && python src/database/init_db.py` |

**Example:**

```bash
cd code/backend
source venv/bin/activate
python src/database/init_db.py
```

## Blockchain Commands

### Compile Smart Contracts

**Command:**

| Command                       | Arguments | Description           | Example                                     |
| ----------------------------- | --------- | --------------------- | ------------------------------------------- |
| `npx hardhat compile`         | None      | Compile all contracts | `cd code/blockchain && npx hardhat compile` |
| `npx hardhat compile --force` | `--force` | Force recompile       | `npx hardhat compile --force`               |

**Example:**

```bash
cd code/blockchain
npx hardhat compile
```

**Output:**

```
Solidity 0.8.19 (solc-js)
Compiling 15 files with 0.8.19
Compilation finished successfully
Compiled 15 Solidity files successfully
```

### Run Local Blockchain Node

**Command:**

| Command                              | Arguments    | Description      | Example                                  |
| ------------------------------------ | ------------ | ---------------- | ---------------------------------------- |
| `npx hardhat node`                   | None         | Start local node | `cd code/blockchain && npx hardhat node` |
| `npx hardhat node --hostname <host>` | `--hostname` | Bind to host     | `npx hardhat node --hostname 0.0.0.0`    |
| `npx hardhat node --port <port>`     | `--port`     | Custom port      | `npx hardhat node --port 8545`           |

**Example:**

```bash
cd code/blockchain
npx hardhat node
```

**Output:**

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

### Deploy Smart Contracts

**Command:**

| Command                                                 | Arguments   | Description       | Example                                                 |
| ------------------------------------------------------- | ----------- | ----------------- | ------------------------------------------------------- |
| `npx hardhat run scripts/deploy.js --network <network>` | `--network` | Deploy to network | `npx hardhat run scripts/deploy.js --network localhost` |

**Supported Networks:**

| Network     | Description              | RPC URL                 | Chain ID |
| ----------- | ------------------------ | ----------------------- | -------- |
| `localhost` | Local Hardhat node       | `http://localhost:8545` | 31337    |
| `sepolia`   | Ethereum Sepolia testnet | Infura/Alchemy          | 11155111 |
| `goerli`    | Ethereum Goerli testnet  | Infura/Alchemy          | 5        |
| `mainnet`   | Ethereum Mainnet         | Infura/Alchemy          | 1        |

**Example:**

```bash
cd code/blockchain

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia
```

**Output:**

```
Deploying PortfolioManager...
PortfolioManager deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
Deploying TradingPlatform...
TradingPlatform deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
Deploying TokenizedAsset...
TokenizedAsset deployed to: 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0

✅ All contracts deployed successfully!
```

### Test Smart Contracts

**Command:**

| Command                             | Arguments | Description        | Example                                          |
| ----------------------------------- | --------- | ------------------ | ------------------------------------------------ |
| `npx hardhat test`                  | None      | Run all tests      | `cd code/blockchain && npx hardhat test`         |
| `npx hardhat test <file>`           | `<file>`  | Run specific test  | `npx hardhat test test/PortfolioManager.test.js` |
| `npx hardhat test --grep <pattern>` | `--grep`  | Run matching tests | `npx hardhat test --grep "portfolio"`            |

**Example:**

```bash
cd code/blockchain
npx hardhat test
```

**Output:**

```
  PortfolioManager
    ✓ Should deploy successfully
    ✓ Should create a new portfolio (45ms)
    ✓ Should add asset to portfolio (52ms)
    ✓ Should update target allocation (38ms)
    ✓ Should record transaction (41ms)

  TradingPlatform
    ✓ Should place buy order (89ms)
    ✓ Should place sell order (76ms)
    ✓ Should match orders (112ms)

  8 passing (1s)
```

### Verify Contracts (Etherscan)

**Command:**

| Command                                                   | Arguments | Description         | Example                                                |
| --------------------------------------------------------- | --------- | ------------------- | ------------------------------------------------------ |
| `npx hardhat verify --network <network> <address> <args>` | Various   | Verify on Etherscan | `npx hardhat verify --network sepolia 0x123... "arg1"` |

**Example:**

```bash
cd code/blockchain
npx hardhat verify --network sepolia \
  0x5FbDB2315678afecb367f032d93F642f64180aa3
```

## Utility Scripts

### lint-all.sh

Runs linting on all code.

**Command:**

| Command                       | Arguments | Description     | Example                       |
| ----------------------------- | --------- | --------------- | ----------------------------- |
| `./scripts/lint-all.sh`       | None      | Lint all code   | `./scripts/lint-all.sh`       |
| `./scripts/lint-all.sh --fix` | `--fix`   | Auto-fix issues | `./scripts/lint-all.sh --fix` |

**Example:**

```bash
./scripts/lint-all.sh
```

**Output:**

```
🔍 Linting BlockGuardian Codebase
================================
Linting Python code (backend)... ✓ No issues
Linting JavaScript/TypeScript (frontend)... ✓ No issues
Linting Solidity (contracts)... ✓ No issues
Linting Shell scripts... ✓ No issues

✅ All linting checks passed!
```

### clean_all.sh

Cleans build artifacts and caches.

**Command:**

| Command                         | Arguments | Description                        | Example                         |
| ------------------------------- | --------- | ---------------------------------- | ------------------------------- |
| `./scripts/clean_all.sh`        | None      | Clean all artifacts                | `./scripts/clean_all.sh`        |
| `./scripts/clean_all.sh --deep` | `--deep`  | Deep clean (includes node_modules) | `./scripts/clean_all.sh --deep` |

**Example:**

```bash
./scripts/clean_all.sh
```

**What it cleans:**

- Python `__pycache__` directories
- Python `.pyc` files
- Node.js `node_modules` (with `--deep`)
- Build artifacts (`build/`, `dist/`)
- Hardhat cache and artifacts
- Log files

### build_all.sh

Builds all components for production.

**Command:**

| Command                  | Arguments | Description          | Example                  |
| ------------------------ | --------- | -------------------- | ------------------------ |
| `./scripts/build_all.sh` | None      | Build all components | `./scripts/build_all.sh` |

**Example:**

```bash
./scripts/build_all.sh
```

**Output:**

```
🏗️ Building BlockGuardian Components
===================================
Building backend... ✓ Complete
Building web frontend... ✓ Complete (/.next)
Building mobile frontend... ✓ Complete
Compiling smart contracts... ✓ Complete

✅ All components built successfully!
```

### log_aggregator.sh

Aggregates logs from all services.

**Command:**

| Command                                        | Arguments   | Description                | Example                                         |
| ---------------------------------------------- | ----------- | -------------------------- | ----------------------------------------------- |
| `./scripts/log_aggregator.sh`                  | None        | Show all logs              | `./scripts/log_aggregator.sh`                   |
| `./scripts/log_aggregator.sh --follow`         | `--follow`  | Follow logs (like tail -f) | `./scripts/log_aggregator.sh --follow`          |
| `./scripts/log_aggregator.sh --service <name>` | `--service` | Show specific service      | `./scripts/log_aggregator.sh --service backend` |

**Example:**

```bash
# Show all logs
./scripts/log_aggregator.sh

# Follow logs in real-time
./scripts/log_aggregator.sh --follow

# Show backend logs only
./scripts/log_aggregator.sh --service backend
```

## Testing Commands

### run_unified_tests.sh

Runs all tests across all components.

**Command:**

| Command                                             | Arguments     | Description             | Example                                              |
| --------------------------------------------------- | ------------- | ----------------------- | ---------------------------------------------------- |
| `./scripts/run_unified_tests.sh`                    | None          | Run all tests           | `./scripts/run_unified_tests.sh`                     |
| `./scripts/run_unified_tests.sh --coverage`         | `--coverage`  | Run with coverage       | `./scripts/run_unified_tests.sh --coverage`          |
| `./scripts/run_unified_tests.sh --component <name>` | `--component` | Test specific component | `./scripts/run_unified_tests.sh --component backend` |

**Example:**

```bash
# Run all tests
./scripts/run_unified_tests.sh

# Run with coverage
./scripts/run_unified_tests.sh --coverage

# Test backend only
./scripts/run_unified_tests.sh --component backend
```

**Output:**

```
🧪 Running BlockGuardian Test Suite
==================================
Running backend tests... ✓ 45 passed, 0 failed
Running frontend tests... ✓ 32 passed, 0 failed
Running contract tests... ✓ 18 passed, 0 failed

Coverage Summary:
  Backend: 82%
  Frontend: 72%
  Contracts: 90%
  Overall: 79%

✅ All tests passed!
```

### Backend Tests

**Command:**

| Command               | Arguments | Description        | Example                     |
| --------------------- | --------- | ------------------ | --------------------------- |
| `pytest`              | None      | Run all tests      | `cd code/backend && pytest` |
| `pytest tests/<file>` | `<file>`  | Run specific file  | `pytest tests/test_auth.py` |
| `pytest -v`           | `-v`      | Verbose output     | `pytest -v`                 |
| `pytest --cov=src`    | `--cov`   | With coverage      | `pytest --cov=src`          |
| `pytest -k <pattern>` | `-k`      | Run matching tests | `pytest -k "auth"`          |

**Example:**

```bash
cd code/backend
source venv/bin/activate

# Run all tests
pytest

# Run with coverage
pytest --cov=src --cov-report=html

# Run specific test file
pytest tests/test_auth.py -v
```

### Frontend Tests

**Command:**

| Command                  | Arguments    | Description       | Example                       |
| ------------------------ | ------------ | ----------------- | ----------------------------- |
| `npm test`               | None         | Run all tests     | `cd web-frontend && npm test` |
| `npm test -- --coverage` | `--coverage` | With coverage     | `npm test -- --coverage`      |
| `npm test -- <file>`     | `<file>`     | Run specific file | `npm test -- Login.test.js`   |

**Example:**

```bash
cd web-frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- Login.test.js
```

## Deployment Commands

### deploy_automation.sh

Automates deployment process.

**Command:**

| Command                                        | Arguments       | Description           | Example                                  |
| ---------------------------------------------- | --------------- | --------------------- | ---------------------------------------- |
| `./scripts/deploy_automation.sh <environment>` | `<environment>` | Deploy to environment | `./scripts/deploy_automation.sh staging` |

**Supported Environments:**

| Environment   | Description            | Target             |
| ------------- | ---------------------- | ------------------ |
| `development` | Local development      | localhost          |
| `staging`     | Staging environment    | Staging servers    |
| `production`  | Production environment | Production servers |

**Example:**

```bash
# Deploy to staging
./scripts/deploy_automation.sh staging

# Deploy to production (requires confirmation)
./scripts/deploy_automation.sh production
```

**Output:**

```
🚀 BlockGuardian Deployment
=========================
Environment: staging
Git Branch: main
Git Commit: abc1234

Pre-deployment checks:
✓ All tests passed
✓ Code quality checks passed
✓ Security scan passed

Building containers...
✓ Backend image built
✓ Frontend image built

Deploying to staging...
✓ Containers deployed
✓ Database migrated
✓ Health checks passed

✅ Deployment to staging complete!
   URL: https://staging.blockguardian.example.com
```

## Docker Commands

### Docker Compose Operations

**Command:**

| Command                     | Arguments | Description             | Example                     |
| --------------------------- | --------- | ----------------------- | --------------------------- |
| `docker-compose up`         | None      | Start services          | `docker-compose up`         |
| `docker-compose up -d`      | `-d`      | Start in background     | `docker-compose up -d`      |
| `docker-compose up --build` | `--build` | Rebuild and start       | `docker-compose up --build` |
| `docker-compose down`       | None      | Stop services           | `docker-compose down`       |
| `docker-compose down -v`    | `-v`      | Stop and remove volumes | `docker-compose down -v`    |
| `docker-compose ps`         | None      | List running services   | `docker-compose ps`         |
| `docker-compose logs`       | None      | View logs               | `docker-compose logs`       |
| `docker-compose logs -f`    | `-f`      | Follow logs             | `docker-compose logs -f`    |
| `docker-compose restart`    | None      | Restart services        | `docker-compose restart`    |

**Examples:**

```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## Environment Variables

Common environment variables used across CLI commands:

| Variable            | Description                 | Default                 | Example                   |
| ------------------- | --------------------------- | ----------------------- | ------------------------- |
| `BLOCKGUARDIAN_ENV` | Environment mode            | `development`           | `production`              |
| `LOG_LEVEL`         | Logging level               | `INFO`                  | `DEBUG`                   |
| `API_URL`           | Backend API URL             | `http://localhost:5000` | `https://api.example.com` |
| `DATABASE_URL`      | Database connection string  | SQLite path             | `postgresql://...`        |
| `REDIS_URL`         | Redis connection string     | `None`                  | `redis://localhost:6379`  |
| `INFURA_API_KEY`    | Infura API key for Ethereum | `None`                  | `your_key_here`           |
| `ETHERSCAN_API_KEY` | Etherscan API key           | `None`                  | `your_key_here`           |

## Quick Reference

**Common Tasks:**

```bash
# Setup environment
./scripts/setup_blockguardian_env.sh

# Start all services
./scripts/run_blockguardian.sh

# Run tests
./scripts/run_unified_tests.sh

# Check health
./scripts/health_check.sh

# View logs
./scripts/log_aggregator.sh --follow

# Deploy smart contracts
cd code/blockchain && npx hardhat run scripts/deploy.js --network localhost

# Start backend only
cd code/backend && python src/main.py

# Build frontend
cd web-frontend && npm run build
```
