# Installation Guide

This guide covers all installation methods for BlockGuardian components.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation Methods](#installation-methods)
- [Platform-Specific Instructions](#platform-specific-instructions)
- [Component Setup](#component-setup)
- [Verification](#verification)
- [Next Steps](#next-steps)

## Prerequisites

### System Requirements

| Component  | Minimum                   | Recommended              |
| ---------- | ------------------------- | ------------------------ |
| CPU        | 2 cores                   | 4+ cores                 |
| RAM        | 4 GB                      | 8+ GB                    |
| Disk Space | 10 GB                     | 50+ GB                   |
| OS         | Linux, macOS, Windows 10+ | Ubuntu 20.04+, macOS 12+ |

### Required Software

| Software       | Version | Purpose                         |
| -------------- | ------- | ------------------------------- |
| Docker         | 20.10+  | Container runtime               |
| Docker Compose | 2.0+    | Multi-container orchestration   |
| Node.js        | 16+     | Frontend and blockchain tooling |
| Python         | 3.9+    | Backend services                |
| Go             | 1.18+   | Performance-critical services   |
| Git            | 2.30+   | Version control                 |

### Optional Software

| Software   | Version       | Purpose                                    |
| ---------- | ------------- | ------------------------------------------ |
| Rust       | Latest stable | High-performance modules                   |
| PostgreSQL | 13+           | Production database (if not using Docker)  |
| Redis      | 6+            | Caching and sessions (if not using Docker) |

## Installation Methods

### Method 1: Automated Setup Script (Recommended)

The fastest way to get started. This script handles all dependencies and configuration.

```bash
# Clone repository
git clone https://github.com/abrar2030/BlockGuardian.git
cd BlockGuardian

# Run automated setup
./scripts/setup_blockguardian_env.sh

# Start all services
./scripts/run_blockguardian.sh
```

**What this does:**

- Checks system prerequisites
- Installs missing dependencies
- Sets up virtual environments
- Creates default configuration files
- Initializes databases
- Starts all services

### Method 2: Docker Compose (Production-Ready)

Best for production deployments and consistent environments.

```bash
# Clone repository
git clone https://github.com/abrar2030/BlockGuardian.git
cd BlockGuardian

# Start all services with Docker
docker-compose up --build

# Run in background (detached mode)
docker-compose up -d --build
```

**Services started:**

- Backend API (port 5000)
- Web Frontend (port 3000)
- PostgreSQL database
- Redis cache

### Method 3: Manual Installation

For development and customization.

See [Component Setup](#component-setup) section below for detailed manual installation.

## Platform-Specific Instructions

### Linux (Ubuntu/Debian)

| Step                        | Command                                                                                            | Notes                        |
| --------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------- |
| 1. Update system            | `sudo apt update && sudo apt upgrade -y`                                                           | Updates package lists        |
| 2. Install Docker           | `curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh`                           | Official Docker installation |
| 3. Add user to docker group | `sudo usermod -aG docker $USER`                                                                    | Allows non-root Docker usage |
| 4. Install Node.js          | `curl -fsSL https://deb.nodesource.com/setup_18.x \| sudo -E bash - && sudo apt install -y nodejs` | Node 18 LTS                  |
| 5. Install Python           | `sudo apt install -y python3.9 python3-pip python3-venv`                                           | Python 3.9+                  |
| 6. Install Git              | `sudo apt install -y git`                                                                          | Version control              |
| 7. Clone BlockGuardian      | `git clone https://github.com/abrar2030/BlockGuardian.git`                                         | Get source code              |
| 8. Run setup                | `cd BlockGuardian && ./scripts/setup_blockguardian_env.sh`                                         | Automated setup              |

### macOS

| Step                      | Command                                                                                           | Notes           |
| ------------------------- | ------------------------------------------------------------------------------------------------- | --------------- |
| 1. Install Homebrew       | `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"` | Package manager |
| 2. Install Docker Desktop | Download from https://www.docker.com/products/docker-desktop                                      | GUI installer   |
| 3. Install Node.js        | `brew install node@18`                                                                            | Node 18 LTS     |
| 4. Install Python         | `brew install python@3.9`                                                                         | Python 3.9+     |
| 5. Install Git            | `brew install git`                                                                                | Version control |
| 6. Clone BlockGuardian    | `git clone https://github.com/abrar2030/BlockGuardian.git`                                        | Get source code |
| 7. Run setup              | `cd BlockGuardian && ./scripts/setup_blockguardian_env.sh`                                        | Automated setup |

### Windows

| Step                         | Command/Action                                               | Notes                       |
| ---------------------------- | ------------------------------------------------------------ | --------------------------- |
| 1. Install WSL2              | `wsl --install` in PowerShell (Admin)                        | Windows Subsystem for Linux |
| 2. Install Ubuntu            | `wsl --install -d Ubuntu-22.04`                              | Ubuntu distribution         |
| 3. Install Docker Desktop    | Download from https://www.docker.com/products/docker-desktop | Enable WSL2 backend         |
| 4. Open WSL2 terminal        | Launch Ubuntu from Start menu                                | Use WSL2 for all commands   |
| 5. Follow Linux instructions | See Linux table above                                        | Continue from step 2        |

**Windows Alternative:** Use Docker Desktop with WSL2 integration and follow Linux instructions inside WSL2 terminal.

## Component Setup

### Backend API

```bash
cd code/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Initialize database
python src/database/init_db.py

# Run development server
python src/main.py
```

**Verify:** Visit http://localhost:5000/health

### Blockchain Contracts

```bash
cd code/blockchain

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your Ethereum node URL and private keys

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2

# Deploy to testnet (e.g., Sepolia)
npx hardhat run scripts/deploy.js --network sepolia
```

**Verify:** Check deployment output for contract addresses.

### Web Frontend

```bash
cd web-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000

# Run development server
npm run dev

# Build for production
npm run build
npm run start
```

**Verify:** Visit http://localhost:3000

### Mobile Frontend

```bash
cd mobile-frontend

# Install dependencies
npm install
# or
yarn install

# Start Metro bundler
npm start

# Run on Android (separate terminal)
npm run android

# Run on iOS (macOS only)
npm run ios
```

**Requirements:**

- Android: Android Studio with SDK 29+
- iOS: Xcode 13+ (macOS only)

### Data Analysis Environment

```bash
cd code/data-analysis

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start Jupyter
jupyter notebook

# Run analysis scripts
python scripts/load_preprocess.py
```

## Verification

### Check All Services

```bash
# Backend health
curl http://localhost:5000/health

# Backend API info
curl http://localhost:5000/api/info

# Web frontend
curl http://localhost:3000

# Docker containers (if using Docker)
docker-compose ps
```

### Expected Outputs

**Backend Health Check:**

```json
{
    "status": "healthy",
    "timestamp": "2025-12-30T10:00:00.000Z",
    "version": "1.0.0",
    "environment": "development",
    "services": {
        "database": "healthy",
        "redis": "healthy"
    }
}
```

**Docker Services:**

```
NAME                          STATUS              PORTS
blockguardian_backend         Up                  0.0.0.0:5000->5000/tcp
blockguardian_web_frontend    Up                  0.0.0.0:3000->3000/tcp
```

## Configuration

After installation, configure your environment:

1. **Backend Configuration**: Edit `code/backend/.env`
    - Set database credentials
    - Configure JWT secrets
    - Set external API keys

2. **Frontend Configuration**: Edit `web-frontend/.env.local`
    - Set backend API URL
    - Configure blockchain provider URLs

3. **Blockchain Configuration**: Edit `code/blockchain/.env`
    - Set Ethereum node URLs (Infura, Alchemy)
    - Configure deployer private keys (testnet only)

See [Configuration Guide](CONFIGURATION.md) for detailed options.

## Troubleshooting Installation

| Issue                     | Solution                                                  |
| ------------------------- | --------------------------------------------------------- |
| Port already in use       | Change port in `.env` or stop conflicting service         |
| Docker permission denied  | Add user to docker group: `sudo usermod -aG docker $USER` |
| Python module not found   | Activate virtual environment: `source venv/bin/activate`  |
| npm install fails         | Clear cache: `npm cache clean --force` and retry          |
| Database connection error | Check PostgreSQL is running: `docker-compose ps`          |
| Redis connection error    | Check Redis is running: `docker-compose ps`               |

For more issues, see [Troubleshooting Guide](TROUBLESHOOTING.md).

## Next Steps

- **Configuration**: Review [Configuration Guide](CONFIGURATION.md)
- **Usage**: See [Usage Guide](USAGE.md) for common workflows
- **API Integration**: Check [API Documentation](API.md)
- **Examples**: Explore [Example Projects](examples/)

## Uninstallation

```bash
# Stop all services
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Remove cloned repository
cd ..
rm -rf BlockGuardian
```
