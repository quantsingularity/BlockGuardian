#!/bin/bash
# Infrastructure Validation Script
# Runs all validation checks for Terraform, Kubernetes, and Ansible

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== BlockGuardian Infrastructure Validation ===${NC}\n"

# Track validation results
VALIDATION_PASSED=true

# Create validation logs directory
mkdir -p "$INFRA_DIR/validation_logs"

# Terraform Validation
echo -e "${YELLOW}=== Terraform Validation ===${NC}"
cd "$INFRA_DIR/terraform"

echo "- Checking Terraform format..."
if terraform fmt -check -recursive 2>&1 | tee "$INFRA_DIR/validation_logs/terraform_fmt.log"; then
    echo -e "${GREEN}✓ Terraform format check passed${NC}"
else
    echo -e "${RED}✗ Terraform format check failed${NC}"
    VALIDATION_PASSED=false
fi

echo "- Initializing Terraform (local backend)..."
if terraform init -backend=false 2>&1 | tee "$INFRA_DIR/validation_logs/terraform_init.log"; then
    echo -e "${GREEN}✓ Terraform init passed${NC}"
else
    echo -e "${RED}✗ Terraform init failed${NC}"
    VALIDATION_PASSED=false
fi

echo "- Validating Terraform configuration..."
if terraform validate 2>&1 | tee "$INFRA_DIR/validation_logs/terraform_validate.log"; then
    echo -e "${GREEN}✓ Terraform validate passed${NC}"
else
    echo -e "${RED}✗ Terraform validate failed${NC}"
    VALIDATION_PASSED=false
fi

echo "- Running TFLint (if available)..."
if command -v tflint &> /dev/null; then
    if tflint --init && tflint 2>&1 | tee "$INFRA_DIR/validation_logs/tflint.log"; then
        echo -e "${GREEN}✓ TFLint passed${NC}"
    else
        echo -e "${YELLOW}⚠ TFLint found issues (check logs)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ TFLint not installed, skipping${NC}"
fi

echo "- Running tfsec (if available)..."
if command -v tfsec &> /dev/null; then
    if tfsec . 2>&1 | tee "$INFRA_DIR/validation_logs/tfsec.log"; then
        echo -e "${GREEN}✓ tfsec passed${NC}"
    else
        echo -e "${YELLOW}⚠ tfsec found issues (check logs)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ tfsec not installed, skipping${NC}"
fi

# Kubernetes Validation
echo -e "\n${YELLOW}=== Kubernetes Validation ===${NC}"
cd "$INFRA_DIR/kubernetes"

echo "- Running YAML lint (if available)..."
if command -v yamllint &> /dev/null; then
    if yamllint -c "$INFRA_DIR/.yamllint" . 2>&1 | tee "$INFRA_DIR/validation_logs/kubernetes_yamllint.log"; then
        echo -e "${GREEN}✓ YAML lint passed${NC}"
    else
        echo -e "${YELLOW}⚠ YAML lint found issues (check logs)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ yamllint not installed, skipping${NC}"
fi

echo "- Building Kustomize overlays..."
if command -v kustomize &> /dev/null; then
    for env in dev staging prod; do
        echo "  - Building $env environment..."
        if kustomize build "environments/$env" > "$INFRA_DIR/validation_logs/kustomize_${env}.yaml" 2>&1; then
            echo -e "${GREEN}✓ Kustomize build $env passed${NC}"
        else
            echo -e "${RED}✗ Kustomize build $env failed${NC}"
            VALIDATION_PASSED=false
        fi
    done
else
    echo -e "${YELLOW}⚠ kustomize not installed, skipping${NC}"
fi

echo "- Validating Kubernetes manifests with kubectl (if available)..."
if command -v kubectl &> /dev/null; then
    echo "  - Testing kubectl dry-run on base manifests..."
    if kubectl apply --dry-run=client -f base/ 2>&1 | tee "$INFRA_DIR/validation_logs/kubectl_dryrun.log"; then
        echo -e "${GREEN}✓ kubectl dry-run passed${NC}"
    else
        echo -e "${YELLOW}⚠ kubectl dry-run found issues (check logs)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ kubectl not installed, skipping${NC}"
fi

# Ansible Validation
echo -e "\n${YELLOW}=== Ansible Validation ===${NC}"
cd "$INFRA_DIR/ansible"

echo "- Running Ansible syntax check..."
if command -v ansible-playbook &> /dev/null; then
    if ansible-playbook playbooks/main.yml --syntax-check -i inventory/hosts.example.yml 2>&1 | tee "$INFRA_DIR/validation_logs/ansible_syntax.log"; then
        echo -e "${GREEN}✓ Ansible syntax check passed${NC}"
    else
        echo -e "${RED}✗ Ansible syntax check failed${NC}"
        VALIDATION_PASSED=false
    fi
else
    echo -e "${YELLOW}⚠ ansible-playbook not installed, skipping${NC}"
fi

echo "- Running ansible-lint (if available)..."
if command -v ansible-lint &> /dev/null; then
    if ansible-lint playbooks/main.yml 2>&1 | tee "$INFRA_DIR/validation_logs/ansible_lint.log"; then
        echo -e "${GREEN}✓ ansible-lint passed${NC}"
    else
        echo -e "${YELLOW}⚠ ansible-lint found issues (check logs)${NC}"
    fi
else
    echo -e "${YELLOW}⚠ ansible-lint not installed, skipping${NC}"
fi

# Final Summary
echo -e "\n${YELLOW}=== Validation Summary ===${NC}"
if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✓ All critical validations passed!${NC}"
    echo "Validation logs saved to: $INFRA_DIR/validation_logs/"
    exit 0
else
    echo -e "${RED}✗ Some validations failed. Check logs for details.${NC}"
    echo "Validation logs saved to: $INFRA_DIR/validation_logs/"
    exit 1
fi
