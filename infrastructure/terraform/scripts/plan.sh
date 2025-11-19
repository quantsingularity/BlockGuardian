#!/bin/bash
# Script to run terraform plan for a given environment

# Exit immediately if a command exits with a non-zero status.
set -e

ENVIRONMENT=$1
PLAN_FILE="${ENVIRONMENT}.tfplan"

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: $0 <environment> (e.g., dev, staging, prod)"
  exit 1
fi

ENV_DIR="../environments/$ENVIRONMENT"

if [ ! -d "$ENV_DIR" ]; then
  echo "Error: Environment directory 	'$ENV_DIR' not found."
  exit 1
fi

echo "Running Terraform plan for environment: $ENVIRONMENT"

# Navigate to the main Terraform configuration directory
cd .. # Go up to infrastructure/terraform/

terraform plan -var-file="$ENV_DIR/terraform.tfvars" -out="$PLAN_FILE"

echo "Terraform plan completed for $ENVIRONMENT. Plan saved to $PLAN_FILE."
