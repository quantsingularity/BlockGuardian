# BlockGuardian Documentation

**Version:** 1.0.0  
**Last Updated:** 2025-12-30

BlockGuardian is a comprehensive blockchain security and monitoring platform that helps organizations protect their blockchain assets, detect vulnerabilities, and ensure compliance with regulatory requirements.

## Quick Navigation

| Section                               | Description                                                 |
| ------------------------------------- | ----------------------------------------------------------- |
| [Installation](INSTALLATION.md)       | System requirements, installation methods, and setup guides |
| [Usage](USAGE.md)                     | Common usage patterns for CLI and library integration       |
| [API Reference](API.md)               | Complete REST API documentation with examples               |
| [CLI Reference](CLI.md)               | Command-line interface documentation                        |
| [Configuration](CONFIGURATION.md)     | Configuration options and environment variables             |
| [Feature Matrix](FEATURE_MATRIX.md)   | Complete feature overview and availability                  |
| [Architecture](ARCHITECTURE.md)       | System architecture and component design                    |
| [Examples](EXAMPLES/)                 | Practical examples and use cases                            |
| [Contributing](CONTRIBUTING.md)       | Guidelines for contributing to the project                  |
| [Troubleshooting](TROUBLESHOOTING.md) | Common issues and solutions                                 |

## Quick Start

BlockGuardian is a multi-component platform consisting of backend services, blockchain smart contracts, web and mobile frontends, and data analysis tools.

### 3-Step Quickstart

1. **Clone and Setup**

    ```bash
    git clone https://github.com/quantsingularity/BlockGuardian.git
    cd BlockGuardian
    ./scripts/setup_blockguardian_env.sh
    ```

2. **Start Services**

    ```bash
    docker-compose up --build
    # Or use the convenience script
    ./scripts/run_blockguardian.sh
    ```

3. **Access the Platform**
    - Web Dashboard: http://localhost:3000
    - Backend API: http://localhost:5000
    - API Health: http://localhost:5000/health

## What's New

### Recent Features (v1.0.0)

- **Multi-Factor Authentication (MFA)**: Enhanced security with TOTP-based 2FA
- **Portfolio Management Smart Contracts**: On-chain portfolio tracking and rebalancing
- **Advanced Compliance Reporting**: Automated KYC/AML compliance checks
- **Real-time Monitoring Dashboard**: Live blockchain transaction monitoring
- **AI-Powered Anomaly Detection**: Machine learning models for threat detection

## Core Capabilities

BlockGuardian provides four main capability areas:

1. **Security Monitoring**: Real-time transaction monitoring, anomaly detection, smart contract auditing
2. **Compliance & Governance**: KYC/AML compliance, audit trails, regulatory reporting
3. **Analytics & Reporting**: Security dashboards, incident response, forensic analysis
4. **Developer Tools**: Secure development guidelines, code analysis, testing frameworks

## Technology Overview

- **Backend**: Python (Flask), PostgreSQL, Redis, Celery
- **Smart Contracts**: Solidity, Hardhat, OpenZeppelin
- **Web Frontend**: React, TypeScript, Next.js, Tailwind CSS
- **Mobile**: React Native
- **Infrastructure**: Docker, Kubernetes, Terraform, Ansible

## Documentation Structure

```
docs/
├── README.md                    # This file - documentation index
├── INSTALLATION.md              # Installation and setup
├── USAGE.md                     # Usage patterns and workflows
├── API.md                       # REST API reference
├── CLI.md                       # Command-line interface
├── CONFIGURATION.md             # Configuration reference
├── FEATURE_MATRIX.md            # Feature availability matrix
├── ARCHITECTURE.md              # Architecture documentation
├── CONTRIBUTING.md              # Contribution guidelines
├── TROUBLESHOOTING.md           # Common issues and fixes
├── DELIVERABLE_CHECKLIST.md     # Quality assurance checklist
├── examples/                    # Example code and tutorials
│   ├── basic-portfolio.md
│   ├── security-monitoring.md
│   └── smart-contract-audit.md
├── api/                         # Detailed API specifications
└── diagnostics/                 # Test results and diagnostics
```

## Support and Resources

- **GitHub Repository**: https://github.com/quantsingularity/BlockGuardian
- **Issues & Bug Reports**: https://github.com/quantsingularity/BlockGuardian/issues
- **License**: MIT License - see [LICENSE](../LICENSE)

## Next Steps

- New users: Start with [Installation Guide](INSTALLATION.md)
- Developers: Review [API Documentation](API.md) and [Examples](EXAMPLES/)
- DevOps: Check [Architecture](ARCHITECTURE.md) and [Configuration](CONFIGURATION.md)
- Contributors: Read [Contributing Guidelines](CONTRIBUTING.md)
