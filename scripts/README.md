# BlockGuardian Automation Scripts

This package contains a set of automation scripts designed to enhance the development workflow, testing, and deployment processes for the BlockGuardian repository. These scripts address various repetitive and manual tasks identified during a comprehensive review of the repository.

## Contents

1. **Unified Testing Script** (`run_unified_tests.sh`): Automates testing across all components of the BlockGuardian project, generating consolidated test reports.

2. **Health Check Script** (`health_check.sh`): Monitors the health of all running BlockGuardian components and provides a consolidated status report.

3. **Log Aggregation Script** (`log_aggregator.sh`): Collects and aggregates logs from all BlockGuardian components into a centralized location for easier monitoring and troubleshooting.

4. **Deployment Automation Script** (`deploy_automation.sh`): Automates the deployment process for BlockGuardian components, handling building, testing, and deploying to various environments.

## Installation

1. Extract the contents of this zip file to the root directory of your BlockGuardian repository.
2. Make the scripts executable:
   ```bash
   chmod +x scripts/*.sh
   ```

## Usage

### Unified Testing

Run tests across all components and generate a consolidated report:

```bash
./scripts/run_unified_tests.sh
```

The test results will be saved in the `test-results` directory.

### Health Check

Check the health of all running BlockGuardian components:

```bash
./scripts/health_check.sh
```

The health check results will be saved in the `health-checks` directory.

### Log Aggregation

Collect and aggregate logs from all components:

```bash
./scripts/log_aggregator.sh
```

The aggregated logs will be saved in the `logs/aggregated` directory.

### Deployment Automation

Deploy BlockGuardian components to various environments:

```bash
./scripts/deploy_automation.sh --environment [development|staging|production] --component [all|backend|web-frontend|mobile-frontend|blockchain]
```

Options:
- `-e, --environment`: Specify deployment environment (development, staging, production)
- `-c, --component`: Deploy specific component (backend, web-frontend, mobile-frontend, blockchain)
- `-s, --skip-tests`: Skip running tests before deployment
- `-h, --help`: Show help message

## Customization

Each script is designed to be modular and easily customizable. You can modify the scripts to fit your specific requirements by editing the relevant sections.

## Documentation

For more detailed information about each script, please refer to the comments within the script files themselves or the validation report included in this package.

## License

These scripts are provided under the same license as the BlockGuardian repository.
