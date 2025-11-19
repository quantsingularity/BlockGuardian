#!/bin/bash
# Script to run terraform apply for a given environment

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

if [ ! -f "../$PLAN_FILE" ]; then
  echo "Error: Plan file '../$PLAN_FILE' not found. Please run 'plan.sh $ENVIRONMENT' first."
  exit 1
fi

echo "Running Terraform apply for environment: $ENVIRONMENT using plan file: $PLAN_FILE"

# Navigate to the main Terraform configuration directory
cd .. # Go up to infrastructure/terraform/

terraform apply "$PLAN_FILE"

echo "Terraform apply completed for $ENVIRONMENT."
