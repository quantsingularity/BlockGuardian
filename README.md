# BlockGuardian Project

[![CI Status](https://img.shields.io/github/actions/workflow/status/abrar2030/BlockGuardian/ci-cd.yml?branch=main&label=CI&logo=github)](https://github.com/abrar2030/BlockGuardian/actions)
[![CI Status](https://img.shields.io/github/workflow/status/abrar2030/BlockGuardian/CI/main?label=CI)](https://github.com/abrar2030/BlockGuardian/actions)
[![Test Coverage](https://img.shields.io/codecov/c/github/abrar2030/BlockGuardian/main?label=Coverage)](https://codecov.io/gh/abrar2030/BlockGuardian)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

BlockGuardian is a comprehensive platform aimed at enhancing security and providing analytical insights within the blockchain and decentralized finance (DeFi) space. It integrates backend services, smart contracts, data analysis capabilities, and user-facing frontends (web and mobile) to deliver a robust solution for users and administrators.

<div align="center">
  <img src="docs/BlockGuardian.bmp" alt="Fraud Detection System for Decentralized Finance (DeFi)" width="100%">
</div>

> **Note**: BlockGuardian is currently under active development. Features and functionalities are being added and improved continuously to enhance user experience.

## Table of Contents
- [Project Structure](#project-structure)
- [Feature Implementation Status](#feature-implementation-status)
- [Getting Started](#getting-started)
- [Key Scripts](#key-scripts)
- [Infrastructure](#infrastructure)
- [Testing](#testing)
- [CI/CD Pipeline](#cicd-pipeline)
- [Contributing](#contributing)
- [License](#license)

## Project Structure

The project is organized into the following main directories:

- `backend/`: Contains the Python/Flask backend application responsible for API services, business logic, and database interactions.
- `blockchain-contracts/`: Houses the Solidity smart contracts, managed and tested using Hardhat. This includes contracts for core functionalities of the platform.
- `data-analysis/`: Includes Python scripts and Jupyter notebooks for data processing, exploratory data analysis (EDA), and potentially machine learning model development for fraud detection or market insights.
- `mobile-frontend/`: The React Native application for providing a mobile user experience.
- `web-frontend/`: The Next.js web application for the primary user interface and interaction with the backend services and blockchain.
- `infrastructure/`: Contains infrastructure-as-code configurations using Ansible, Kubernetes, and Terraform for deployment and management of the platform.
- `resources/`: Contains static assets, datasets, design documents, and reference materials.

## Feature Implementation Status

| Feature | Status | Description | Planned Release |
|---------|--------|-------------|----------------|
| **Backend Services** |
| API Services | ✅ Implemented | Core API endpoints for platform functionality | v1.0 |
| Business Logic | ✅ Implemented | Core business rules and processing | v1.0 |
| Database Integration | ✅ Implemented | Data persistence and retrieval | v1.0 |
| Authentication | ✅ Implemented | User authentication and authorization | v1.0 |
| Analytics Engine | 🔄 In Progress | Advanced data analysis capabilities | v1.1 |
| Notification System | 🔄 In Progress | User alerts and notifications | v1.1 |
| **Blockchain Contracts** |
| Core Smart Contracts | ✅ Implemented | Primary blockchain functionality | v1.0 |
| Security Monitoring | ✅ Implemented | Transaction and contract monitoring | v1.0 |
| Fraud Detection | 🔄 In Progress | Automated fraud pattern recognition | v1.1 |
| Governance Contracts | 📅 Planned | Decentralized governance mechanisms | v1.2 |
| **Data Analysis** |
| Data Processing | ✅ Implemented | ETL pipelines for blockchain data | v1.0 |
| Exploratory Analysis | ✅ Implemented | Jupyter notebooks for data exploration | v1.0 |
| ML Model Development | 🔄 In Progress | Fraud detection and market prediction models | v1.1 |
| Automated Reporting | 📅 Planned | Scheduled analysis and reporting | v1.2 |
| **Mobile Frontend** |
| User Authentication | ✅ Implemented | Secure login and registration | v1.0 |
| Dashboard | ✅ Implemented | Main user interface | v1.0 |
| Transaction Monitoring | ✅ Implemented | View and track transactions | v1.0 |
| Security Alerts | 🔄 In Progress | Real-time security notifications | v1.1 |
| Advanced Analytics | 📅 Planned | Mobile access to analytical tools | v1.2 |
| **Web Frontend** |
| Admin Dashboard | ✅ Implemented | Administrative control panel | v1.0 |
| User Dashboard | ✅ Implemented | User interface for platform access | v1.0 |
| Analytics Dashboard | 🔄 In Progress | Data visualization and insights | v1.1 |
| Reporting Tools | 📅 Planned | Custom report generation | v1.2 |
| **Infrastructure** |
| Ansible Configuration | ✅ Implemented | Server configuration management | v1.0 |
| Kubernetes Deployment | ✅ Implemented | Container orchestration | v1.0 |
| Terraform Scripts | ✅ Implemented | Infrastructure as code | v1.0 |
| CI/CD Pipeline | 🔄 In Progress | Automated testing and deployment | v1.1 |
| Monitoring Setup | 🔄 In Progress | System health and performance monitoring | v1.1 |

**Legend:**
- ✅ Implemented: Feature is complete and available
- 🔄 In Progress: Feature is currently being developed
- 📅 Planned: Feature is planned for future release

## Getting Started

### Prerequisites

Ensure you have the following installed on your system:

- Docker and Docker Compose
- Node.js (LTS version recommended, e.g., v18 or v20)
- Python (version 3.9+ recommended)
- For `blockchain-contracts`: `yarn` or `npm`
- For `mobile-frontend`: React Native development environment (see React Native official documentation)
- For `infrastructure`:
    - Ansible
    - Terraform
    - kubectl (for Kubernetes)

### Installation & Setup

1.  **Clone the repository (if applicable):**
    ```bash
    git clone https://github.com/abrar2030/BlockGuardian
    cd BlockGuardian
    ```

2.  **Root Level Setup:**
    -   A `docker-compose.yml` file is provided to orchestrate the main services (backend, web-frontend). Review and customize it if necessary.

3.  **Backend (`backend/`):**
    -   Navigate to the `backend` directory: `cd backend`
    -   Create a virtual environment (optional but recommended):
        ```bash
        python -m venv venv
        source venv/bin/activate  # On Windows: venv\Scripts\activate
        ```
    -   Install dependencies: `pip install -r requirements.txt`
    -   Set up environment variables: Create a `.env` file based on a potential `.env.example` (if provided) for database connections, API keys, etc.
    -   To run using Docker (recommended for consistency):
        ```bash
        ./start.sh build
        ./start.sh start
        ```
    -   To run directly (if not using Docker for development):
        ```bash
        flask run # Ensure FLASK_APP is set, e.g., export FLASK_APP=run.py
        ```

4.  **Blockchain Contracts (`blockchain-contracts/`):**
    -   Navigate to the `blockchain-contracts` directory: `cd blockchain-contracts`
    -   Install dependencies: `npm install` (or `yarn install`)
    -   Compile contracts: `npx hardhat compile`
    -   Run tests: `npx hardhat test`
    -   Deploy to a local network (requires a Hardhat node running):
        -   Start a local Hardhat node: `npx hardhat node`
        -   In another terminal, deploy: `npx hardhat run scripts/deploy.js --network localhost`

5.  **Data Analysis (`data-analysis/`):**
    -   Navigate to the `data-analysis` directory: `cd data-analysis`
    -   Create a virtual environment and install dependencies:
        ```bash
        python -m venv venv
        source venv/bin/activate
        pip install -r requirements.txt
        ```
    -   Run scripts: `python scripts/load_preprocess.py` (or other scripts)
    -   Explore notebooks: Launch JupyterLab (`jupyter lab`) and open notebooks from the `notebooks/` directory.

6.  **Mobile Frontend (`mobile-frontend/`):**
    -   Navigate to the `mobile-frontend` directory: `cd mobile-frontend`
    -   Install dependencies: `yarn install` (or `npm install`)
    -   Run on simulator/device (refer to React Native documentation):
        ```bash
        yarn android # or npx react-native run-android
        yarn ios   # or npx react-native run-ios
        ```

7.  **Web Frontend (`web-frontend/`):**
    -   Navigate to the `web-frontend` directory: `cd web-frontend`
    -   Install dependencies: `npm install`
    -   Run in development mode: `npm run dev` (usually accessible at `http://localhost:3000`)
    -   Build for production: `npm run build`
    -   Start production server: `npm run start`

### Running the Entire Project (using Docker Compose - simplified)

A `docker-compose.yml` file is provided at the root to simplify running the core services (backend, web-frontend). Other services like blockchain nodes or data analysis environments might need separate management or integration into the Docker Compose setup if desired.

```bash
# From the project root directory
docker-compose up --build
```

This command will build the images for the services defined in `docker-compose.yml` (if not already built) and start them.

## Key Scripts

-   `backend/start.sh`: Manages the backend Docker container (build, start, stop, logs).
-   `blockchain-contracts/package.json`: Contains scripts for compiling, testing, and deploying smart contracts.
-   `web-frontend/package.json`: Contains scripts for developing, building, and running the web frontend.
-   `mobile-frontend/package.json`: Contains scripts for developing and running the mobile frontend.
-   `run-all.sh` (at root, if created): A potential script to orchestrate multiple components (e.g., start backend, frontend, local blockchain node).

## Infrastructure

-   **Ansible (`infrastructure/ansible/`):** Playbooks and roles for configuration management.
-   **Kubernetes (`infrastructure/kubernetes/`):** Manifests for deploying the application to a Kubernetes cluster.
-   **Terraform (`infrastructure/terraform/`):** Configurations for provisioning cloud infrastructure.

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
- Build: ![Build Status](https://img.shields.io/github/workflow/status/abrar2030/BlockGuardian/CI/main?label=build)
- Test Coverage: ![Coverage](https://img.shields.io/codecov/c/github/abrar2030/BlockGuardian/main?label=coverage)
- Code Quality: ![Code Quality](https://img.shields.io/codacy/grade/abrar2030/BlockGuardian?label=code%20quality)

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

This project is licensed under the MIT License - see the LICENSE file for details.