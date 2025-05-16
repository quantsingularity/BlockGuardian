#!/bin/bash
# Script to run terraform init for a given environment

# Exit immediately if a command exits with a non-zero status.
set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: $0 <environment> (e.g., dev, staging, prod)"
  exit 1
fi

ENV_DIR="../environments/$ENVIRONMENT"

if [ ! -d "$ENV_DIR" ]; then
  echo "Error: Environment directory '$ENV_DIR' not found."
  exit 1
fi

echo "Running Terraform init for environment: $ENVIRONMENT"

# Navigate to the main Terraform configuration directory
cd .. # Go up to infrastructure/terraform/

terraform init -reconfigure -backend-config="$ENV_DIR/terraform.tfvars"

# The -reconfigure flag is useful if backend settings change.
# The -backend-config flag points to environment-specific backend configurations if you have them in tfvars.
# If your backend.tf is generic and tfvars only contain variable values, you might not need -backend-config here
# if the backend block itself doesn't use variables that are only defined in the tfvars.
# However, it's common to pass the tfvars file for the backend if it contains specifics like state file paths per env.

# If you are using local state and want to keep states separate per environment, you might need a different strategy
# or ensure your backend.tf is configured to use a path that includes the environment name, potentially set via tfvars.

echo "Terraform init completed for $ENVIRONMENT."

