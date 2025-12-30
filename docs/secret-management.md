# Secret Management Documentation

## Overview

This document outlines the secure secret management practices implemented in the BlockGuardian project's CI/CD pipelines.

## GitHub Secrets

The CI/CD pipelines use GitHub's encrypted secrets feature to securely store sensitive information:

1. **Docker Registry Credentials**
    - `DOCKER_USERNAME`: Username for Docker Hub or private registry
    - `DOCKER_PASSWORD`: Password for Docker Hub or private registry

2. **Deployment Credentials**
    - `SSH_PRIVATE_KEY`: SSH key for secure server access
    - `SSH_KNOWN_HOSTS`: Known hosts file content for SSH verification
    - `PRODUCTION_SERVER_HOST`: Hostname/IP of the production server
    - `PRODUCTION_SERVER_USER`: Username for SSH access to production server

3. **Blockchain Deployment**
    - `BLOCKCHAIN_PRIVATE_KEY`: Private key for deploying smart contracts
    - `INFURA_API_KEY`: API key for Infura blockchain node access
    - `ETHERSCAN_API_KEY`: API key for Etherscan contract verification

## Best Practices Implemented

1. **Least Privilege Access**
    - Secrets are only accessible in specific workflow jobs that require them
    - Different secrets are used for different environments (dev, staging, production)

2. **No Secret Exposure**
    - Secrets are never logged or exposed in build outputs
    - Debug information is carefully controlled to prevent accidental exposure

3. **Rotation Policy**
    - All secrets should be rotated regularly (recommended: every 90 days)
    - Immediate rotation upon any suspected compromise

4. **Environment Separation**
    - Different secrets for development, testing, and production environments
    - Production secrets are restricted to main branch deployments only

## Local Development

For local development, developers should:

1. Use `.env` files (which are git-ignored)
2. Never commit secrets to the repository
3. Use the provided scripts that automatically load from `.env` files

## Adding New Secrets

To add new secrets to the CI/CD pipeline:

1. Go to the GitHub repository settings
2. Navigate to Secrets > Actions
3. Click "New repository secret"
4. Add the secret name and value
5. Update the workflow files to use the new secret

## Security Auditing

The CI/CD pipeline includes security scanning for:

- Dependency vulnerabilities
- Smart contract security issues
- Code quality and best practices
