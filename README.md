# BlockGuardian Project

## Overview

BlockGuardian is a comprehensive platform aimed at enhancing security and providing analytical insights within the blockchain and decentralized finance (DeFi) space. It integrates backend services, smart contracts, data analysis capabilities, and user-facing frontends (web and mobile) to deliver a robust solution for users and administrators.

<div align="center">
  <img src="docs/BlockGuardian.bmp" alt="Fraud Detection System for Decentralized Finance (DeFi)" width="100%">
</div>

> **Note**: BlockGuardian is currently under active development. Features and functionalities are being added and improved continuously to enhance user experience.

## Project Structure

The project is organized into the following main directories:

- `backend/`: Contains the Python/Flask backend application responsible for API services, business logic, and database interactions.
- `blockchain-contracts/`: Houses the Solidity smart contracts, managed and tested using Hardhat. This includes contracts for core functionalities of the platform.
- `data-analysis/`: Includes Python scripts and Jupyter notebooks for data processing, exploratory data analysis (EDA), and potentially machine learning model development for fraud detection or market insights.
- `mobile-frontend/`: The React Native application for providing a mobile user experience.
- `web-frontend/`: The Next.js web application for the primary user interface and interaction with the backend services and blockchain.
- `infrastructure/`: Contains infrastructure-as-code configurations using Ansible, Kubernetes, and Terraform for deployment and management of the platform.
- `resources/`: Contains static assets, datasets, design documents, and reference materials.

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
    # git clone https://github.com/abrar2030/BlockGuardian
    # cd BlockGuardian
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

## Contributing

(Details on contributing guidelines, code style, pull request process would go here if this were an open project.)

## License

(Specify project license, e.g., MIT, Apache 2.0. Assuming MIT for now.)

This project is licensed under the MIT License - see the LICENSE file for details (if one is created).

