# .github Directory

This directory contains GitHub-specific configurations and automation workflows for the BlockGuardian project. It plays a crucial role in maintaining code quality, running tests, and deploying the application across different environments.

## Structure

- **workflows/**: Contains GitHub Actions workflow definitions that automate testing, building, and deployment processes.

## Workflows

The directory includes three main CI/CD pipelines:

1. **backend-ci-cd.yml**: Specific pipeline for the backend components that:
   - Runs on pushes and pull requests to main and develop branches
   - Tests Python backend code with pytest
   - Builds and pushes Docker images
   - Deploys to production when merging to main

2. **ci-cd.yml**: General pipeline that:
   - Runs tests for backend, blockchain, and frontend components
   - Builds the application when pushing to main/master
   - Prepares for deployment

3. **smart-contracts-ci-cd.yml**: Specialized pipeline for blockchain contracts that:
   - Compiles and tests smart contracts
   - Performs security audits using Slither and Mythril
   - Deploys contracts to testnet
   - Verifies contracts on Etherscan

## Usage

These workflows run automatically based on their trigger conditions. Developers should ensure their code passes all checks before merging pull requests.

## Best Practices

- Always review workflow failures before merging code
- Keep secrets and environment variables updated in GitHub repository settings
- Test workflow changes in feature branches before updating main workflows
