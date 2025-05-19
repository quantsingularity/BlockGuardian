# BlockGuardian

[![CI/CD Status](https://img.shields.io/github/actions/workflow/status/abrar2030/BlockGuardian/ci-cd.yml?branch=main&label=CI/CD&logo=github)](https://github.com/abrar2030/BlockGuardian/actions)
[![Smart Contracts](https://img.shields.io/github/actions/workflow/status/abrar2030/BlockGuardian/smart-contracts-ci-cd.yml?branch=main&label=Smart%20Contracts&logo=ethereum)](https://github.com/abrar2030/BlockGuardian/actions)
[![Backend](https://img.shields.io/github/actions/workflow/status/abrar2030/BlockGuardian/backend-ci-cd.yml?branch=main&label=Backend&logo=fastapi)](https://github.com/abrar2030/BlockGuardian/actions)
[![License](https://img.shields.io/github/license/abrar2030/BlockGuardian)](https://github.com/abrar2030/BlockGuardian/blob/main/LICENSE)

## 🔒 Blockchain Security & Monitoring Platform

BlockGuardian is a comprehensive blockchain security and monitoring platform that helps organizations protect their blockchain assets, detect vulnerabilities, and ensure compliance with regulatory requirements.

<div align="center">
  <img src="resources/blockguardian_dashboard.png" alt="BlockGuardian Dashboard" width="80%">
</div>

> **Note**: This project is under active development. Features and functionalities are continuously being enhanced to improve security capabilities and user experience.

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Key Scripts](#key-scripts)
- [Infrastructure](#infrastructure)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

## Overview

BlockGuardian provides a robust set of tools for monitoring blockchain networks, analyzing smart contract vulnerabilities, detecting suspicious transactions, and ensuring compliance with regulatory requirements. The platform combines advanced security techniques with user-friendly interfaces to make blockchain security accessible to organizations of all sizes.

## Key Features

### Security Monitoring
- **Real-time Transaction Monitoring**: Track and analyze blockchain transactions as they occur
- **Anomaly Detection**: Identify suspicious patterns and potential security threats
- **Smart Contract Auditing**: Automated and manual auditing tools for smart contract code
- **Vulnerability Scanning**: Detect common security vulnerabilities in blockchain applications

### Compliance & Governance
- **Regulatory Compliance**: Tools to ensure adherence to relevant regulations (GDPR, AML, KYC)
- **Audit Trail**: Immutable record of all security-related activities
- **Risk Assessment**: Evaluate and quantify security risks in blockchain implementations
- **Governance Framework**: Establish and enforce security policies for blockchain operations

### Analytics & Reporting
- **Security Dashboards**: Visualize security metrics and KPIs
- **Incident Response**: Tools for managing and responding to security incidents
- **Forensic Analysis**: Investigate security breaches and unauthorized activities
- **Compliance Reporting**: Generate reports for regulatory compliance

### Developer Tools
- **Secure Development Guidelines**: Best practices for blockchain development
- **Code Analysis**: Static and dynamic analysis tools for smart contracts
- **Testing Framework**: Comprehensive testing tools for blockchain applications
- **Security Plugins**: Integrations with popular development environments

## Architecture

BlockGuardian follows a modular architecture with the following components:

```
BlockGuardian/
├── Core Services
│   ├── Monitoring Engine
│   ├── Analysis Engine
│   ├── Alert System
│   └── Reporting Service
├── Frontend Applications
│   ├── Web Dashboard
│   └── Mobile App
├── Blockchain Connectors
│   ├── Ethereum Connector
│   ├── Bitcoin Connector
│   ├── Solana Connector
│   └── Other Chain Connectors
└── Infrastructure
    ├── Database Cluster
    ├── Message Queue
    ├── Cache Layer
    └── API Gateway
```

## Technology Stack

### Backend
- **Languages**: Python, Rust, Go
- **Frameworks**: FastAPI, Actix, Gin
- **Database**: PostgreSQL, MongoDB, Redis
- **Message Queue**: Kafka, RabbitMQ
- **Blockchain**: Web3.py, ethers.js, Solidity

### Frontend
- **Framework**: React with TypeScript
- **State Management**: Redux Toolkit
- **Data Visualization**: D3.js, Recharts
- **Styling**: Tailwind CSS, Styled Components
- **Web3**: ethers.js, web3.js

### Mobile App
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Redux Toolkit
- **UI Components**: React Native Paper

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Infrastructure as Code**: Terraform, Ansible

## Project Structure

The project is organized into several main components:

```
BlockGuardian/
├── backend/                # Backend services and API
├── blockchain/             # Blockchain interaction libraries
├── blockchain-contracts/   # Smart contracts and related code
├── code/                   # Shared code and utilities
├── data-analysis/          # Data analysis and ML components
├── docs/                   # Documentation
├── infrastructure/         # DevOps and infrastructure code
├── mobile-frontend/        # Mobile application
└── web-frontend/           # Web dashboard
```

## Installation & Setup

### Prerequisites
- Docker and Docker Compose
- Node.js (v16+)
- Python (v3.9+)
- Go (v1.18+)
- Rust (latest stable)

### Setup Using Environment Script
The easiest way to set up the development environment is to use the provided setup script:

```bash
# Clone the repository
git clone https://github.com/abrar2030/BlockGuardian.git
cd BlockGuardian

# Run the setup script
./setup_blockguardian_env.sh

# Start the application
./run_blockguardian.sh
```

### Manual Setup for Individual Components

1. **Backend (`backend/`):**
   - Navigate to the `backend` directory: `cd backend`
   - Create a virtual environment: `python -m venv venv`
   - Activate the virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
   - Install dependencies: `pip install -r requirements.txt`
   - Set up environment variables: `cp .env.example .env` and edit as needed
   - Run the development server: `uvicorn main:app --reload`

2. **Blockchain Contracts (`blockchain-contracts/`):**
   - Navigate to the `blockchain-contracts` directory: `cd blockchain-contracts`
   - Install dependencies: `npm install`
   - Compile contracts: `npx hardhat compile`
   - Run tests: `npx hardhat test`
   - Deploy contracts: `npx hardhat run scripts/deploy.js --network <network_name>`

3. **Data Analysis (`data-analysis/`):**
   - Navigate to the `data-analysis` directory: `cd data-analysis`
   - Create a virtual environment: `python -m venv venv`
   - Activate the virtual environment: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
   - Install dependencies: `pip install -r requirements.txt`
   - Run Jupyter notebook: `jupyter notebook`

4. **Blockchain Interaction (`blockchain/`):**
   - Navigate to the `blockchain` directory: `cd blockchain`
   - Install dependencies: `npm install` or `go mod download` depending on the implementation

5. **Mobile Frontend (`mobile-frontend/`):**
   - Navigate to the `mobile-frontend` directory: `cd mobile-frontend`
   - Install dependencies: `npm install` or `yarn install`
   - Start the development server: `npm start` or `yarn start`
   - Run on Android or iOS:
     ```bash
     yarn android # or npx react-native run-android
     yarn ios   # or npx react-native run-ios
     ```

6. **Web Frontend (`web-frontend/`):**
   - Navigate to the `web-frontend` directory: `cd web-frontend`
   - Install dependencies: `npm install`
   - Run in development mode: `npm run dev` (usually accessible at `http://localhost:3000`)
   - Build for production: `npm run build`
   - Start production server: `npm run start`

### Running the Entire Project (using Docker Compose)

A `docker-compose.yml` file is provided at the root to simplify running the core services (backend, web-frontend). Other services like blockchain nodes or data analysis environments might need separate management or integration into the Docker Compose setup if desired.

```bash
# From the project root directory
docker-compose up --build
```

This command will build the images for the services defined in `docker-compose.yml` (if not already built) and start them.

## Key Scripts

- `backend/start.sh`: Manages the backend Docker container (build, start, stop, logs)
- `blockchain-contracts/package.json`: Contains scripts for compiling, testing, and deploying smart contracts
- `web-frontend/package.json`: Contains scripts for developing, building, and running the web frontend
- `mobile-frontend/package.json`: Contains scripts for developing and running the mobile frontend
- `run_blockguardian.sh`: Orchestrates multiple components (e.g., start backend, frontend, local blockchain node)
- `validate_code_quality.py`: Runs code quality checks across the project

## Infrastructure

- **Ansible (`infrastructure/ansible/`):** Playbooks and roles for configuration management
- **Kubernetes (`infrastructure/kubernetes/`):** Manifests for deploying the application to a Kubernetes cluster
- **Terraform (`infrastructure/terraform/`):** Configurations for provisioning cloud infrastructure

## Testing

The project includes comprehensive testing to ensure reliability and security:

### Backend Testing
- Unit tests for API endpoints and services
- Integration tests for database interactions
- Security tests for authentication and authorization

### Smart Contract Testing
- Unit tests for contract functions
- Integration tests for contract interactions
- Security audits and vulnerability testing

### Frontend Testing
- Component tests for UI elements
- End-to-end tests for user workflows
- Accessibility and usability testing

### Data Analysis Testing
- Model validation tests
- Data processing pipeline tests
- Accuracy and performance benchmarks

To run tests:

```bash
# Backend tests
cd backend
pytest

# Smart contract tests
cd blockchain-contracts
npx hardhat test

# Web frontend tests
cd web-frontend
npm test

# Mobile frontend tests
cd mobile-frontend
npm test
```

## CI/CD Pipeline

BlockGuardian uses GitHub Actions for continuous integration and deployment:

### Continuous Integration
- Automated testing on each pull request and push to main
- Code quality checks with ESLint, Prettier, and Pylint
- Test coverage reporting
- Security scanning for vulnerabilities

### Continuous Deployment
- Automated deployment to staging environment on merge to main
- Manual promotion to production after approval
- Infrastructure updates via Terraform
- Kubernetes deployment updates

Current CI/CD Status:
- Main: ![CI/CD Status](https://img.shields.io/github/actions/workflow/status/abrar2030/BlockGuardian/ci-cd.yml?branch=main&label=build)
- Smart Contracts: ![Smart Contracts](https://img.shields.io/github/actions/workflow/status/abrar2030/BlockGuardian/smart-contracts-ci-cd.yml?branch=main&label=contracts)
- Backend: ![Backend](https://img.shields.io/github/actions/workflow/status/abrar2030/BlockGuardian/backend-ci-cd.yml?branch=main&label=backend)

## Contributing

We welcome contributions to improve BlockGuardian! Here's how you can contribute:

1. **Fork the repository**
   - Create your own copy of the project to work on

2. **Create a feature branch**
   - `git checkout -b feature/amazing-feature`
   - Use descriptive branch names that reflect the changes

3. **Make your changes**
   - Follow the coding standards and guidelines
   - Write clean, maintainable, and tested code
   - Update documentation as needed

4. **Commit your changes**
   - `git commit -m 'Add some amazing feature'`
   - Use clear and descriptive commit messages
   - Reference issue numbers when applicable

5. **Push to branch**
   - `git push origin feature/amazing-feature`

6. **Open Pull Request**
   - Provide a clear description of the changes
   - Link to any relevant issues
   - Respond to review comments and make necessary adjustments

### Development Guidelines
- Follow PEP 8 style guide for Python code
- Use ESLint and Prettier for JavaScript/TypeScript code
- Write unit tests for new features
- Update documentation for any changes
- Ensure all tests pass before submitting a pull request
- Keep pull requests focused on a single feature or fix

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
