# BlockGuardian Infrastructure

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Directory Structure](#directory-structure)
- [Terraform Setup](#terraform-setup)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Ansible Configuration](#ansible-configuration)
- [CI/CD](#cicd)
- [Validation & Testing](#validation--testing)
- [Security & Secrets](#security--secrets)
- [Troubleshooting](#troubleshooting)

## Overview

Financial-grade infrastructure for BlockGuardian, implementing:

- **Terraform**: Infrastructure as Code for AWS resources
- **Kubernetes**: Container orchestration with Kustomize overlays
- **Ansible**: Configuration management and security hardening
- **CI/CD**: Automated validation and deployment pipelines

### Compliance Standards

- PCI DSS (Payment Card Industry Data Security Standard)
- SOC 2 (Service Organization Control 2)
- ISO 27001 (Information Security Management)

## Prerequisites

### Required Tools

| Tool         | Minimum Version | Installation                                                                |
| ------------ | --------------- | --------------------------------------------------------------------------- |
| Terraform    | 1.5.0+          | [Download](https://www.terraform.io/downloads)                              |
| kubectl      | 1.27.0+         | [Install Guide](https://kubernetes.io/docs/tasks/tools/)                    |
| kustomize    | 5.0.0+          | [Install Guide](https://kubectl.docs.kubernetes.io/installation/kustomize/) |
| Ansible      | 2.15.0+         | `pip install ansible>=2.15`                                                 |
| AWS CLI      | 2.0+            | [Install Guide](https://aws.amazon.com/cli/)                                |
| TFLint       | 0.44+           | [Install Guide](https://github.com/terraform-linters/tflint)                |
| tfsec        | 1.28+           | [Install Guide](https://github.com/aquasecurity/tfsec)                      |
| ansible-lint | 6.0+            | `pip install ansible-lint`                                                  |
| yamllint     | 1.26+           | `pip install yamllint`                                                      |

### Install All Tools (Linux/macOS)

```bash
# Terraform
wget https://releases.hashicorp.com/terraform/1.5.0/terraform_1.5.0_linux_amd64.zip
unzip terraform_1.5.0_linux_amd64.zip
sudo mv terraform /usr/local/bin/

# kubectl
curl -LO "https://dl.k8s.io/release/v1.27.0/bin/linux/amd64/kubectl"
chmod +x kubectl
sudo mv kubectl /usr/local/bin/

# kustomize
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/

# Ansible and linting tools
pip install ansible>=2.15 ansible-lint yamllint

# AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# TFLint
curl -s https://raw.githubusercontent.com/terraform-linters/tflint/master/install_linux.sh | bash

# tfsec
curl -s https://raw.githubusercontent.com/aquasecurity/tfsec/master/scripts/install_linux.sh | bash
```

## Quick Start

### 1. Clone and Navigate

```bash
git clone https://github.com/quantsingularity/BlockGuardian.git
cd BlockGuardian/infrastructure
```

### 2. Configure AWS Credentials

```bash
aws configure
# Or use environment variables:
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-west-2"
```

### 3. Validate Everything

```bash
# Run all validations
./scripts/validate-all.sh

# Or validate individually:
cd terraform && terraform fmt -check -recursive && terraform validate
cd ../kubernetes && kustomize build environments/dev
cd ../ansible && ansible-lint playbooks/main.yml
```

### 4. Deploy (Development)

```bash
# Deploy Terraform infrastructure
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan

# Deploy Kubernetes resources
cd ../kubernetes
kustomize build environments/dev | kubectl apply --dry-run=client -f -  # Validate first
kustomize build environments/dev | kubectl apply -f -

# Run Ansible configuration
cd ../ansible
ansible-playbook -i inventory/hosts.yml playbooks/main.yml --check  # Dry run
ansible-playbook -i inventory/hosts.yml playbooks/main.yml
```

## Directory Structure

```
infrastructure/
├── terraform/              # Infrastructure as Code
│   ├── main.tf            # Root module
│   ├── backend.tf         # State backend configuration
│   ├── variables.tf       # Input variables
│   ├── outputs.tf         # Output values
│   ├── terraform.tfvars.example  # Example variables file
│   ├── .tflint.hcl       # TFLint configuration
│   └── modules/          # Reusable Terraform modules
│       ├── network/      # VPC, subnets, security groups
│       ├── compute/      # EC2, EKS, Auto Scaling
│       ├── database/     # RDS, DynamoDB
│       ├── storage/      # S3, EBS
│       └── security/     # IAM, KMS, Security Groups
├── kubernetes/            # Kubernetes manifests
│   ├── base/             # Base Kustomize resources
│   │   ├── kustomization.yaml
│   │   ├── *-deployment-fixed.yaml
│   │   ├── *-service.yaml
│   │   ├── backend-service-account.yaml
│   │   ├── backend-role.yaml
│   │   ├── backend-rolebinding.yaml
│   │   └── app-secrets-example.yaml
│   └── environments/     # Environment overlays
│       ├── dev/
│       ├── staging/
│       └── prod/
├── ansible/              # Configuration management
│   ├── ansible.cfg       # Ansible configuration
│   ├── inventory/        # Inventory files
│   │   └── hosts.example.yml
│   ├── playbooks/        # Playbooks
│   │   └── main.yml
│   └── roles/            # Ansible roles
│       ├── common/
│       ├── database/
│       ├── security_hardening/
│       └── webserver/
├── ci-cd/                # CI/CD pipelines
│   ├── ci-cd.yml        # Application CI/CD
│   └── infrastructure-ci-cd.yml  # Infrastructure validation
├── scripts/              # Deployment scripts
│   ├── deploy.sh
│   └── validate-all.sh
├── .gitignore           # Git ignore patterns
├── .yamllint            # YAML linting configuration
└── README.md            # This file
```

## Terraform Setup

### Initialize Backend (Local Development)

```bash
cd terraform

# Create terraform.tfvars from example
cp terraform.tfvars.example terraform.tfvars

# Edit terraform.tfvars with your values
vim terraform.tfvars

# Initialize Terraform (uses local state by default)
terraform init

# Format and validate
terraform fmt -recursive
terraform validate
```

### Initialize Backend (Production - S3)

```bash
# Create S3 bucket for state
aws s3 mb s3://your-terraform-state-bucket --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket your-terraform-state-bucket \
  --versioning-configuration Status=Enabled

# Enable encryption
aws s3api put-bucket-encryption \
  --bucket your-terraform-state-bucket \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Create DynamoDB table for state locking (optional but recommended)
aws dynamodb create-table \
  --table-name terraform-state-lock \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST

# Edit backend.tf and uncomment the S3 backend block
# Then initialize with migration:
terraform init -migrate-state
```

### Terraform Commands

```bash
# Validate configuration
terraform fmt -check -recursive  # Check formatting
terraform fmt -recursive         # Fix formatting
terraform validate               # Validate syntax

# Plan changes
terraform plan -out=tfplan

# Apply changes
terraform apply tfplan

# Destroy resources (careful!)
terraform destroy

# Run security scan
tfsec .

# Run linting
tflint --init
tflint
```

### Using terraform.tfvars

**NEVER commit terraform.tfvars with real secrets!**

```hcl
# terraform.tfvars (not committed to git)
aws_region  = "us-west-2"
environment = "dev"
app_name    = "blockguardian"

# Use environment variables for secrets:
# export TF_VAR_db_username="admin"
# export TF_VAR_db_password="your-secure-password"

# Or use AWS Secrets Manager/Parameter Store in Terraform data sources
```

## Kubernetes Deployment

### Prerequisites

```bash
# Configure kubectl for your cluster
aws eks update-kubeconfig --region us-west-2 --name blockguardian-dev

# Verify connection
kubectl cluster-info
kubectl get nodes
```

### Using Kustomize

```bash
cd kubernetes

# Build and preview (dev)
kustomize build environments/dev

# Validate manifests
kustomize build environments/dev | kubectl apply --dry-run=client -f -

# Apply manifests
kustomize build environments/dev | kubectl apply -f -

# For staging/production:
kustomize build environments/staging | kubectl apply -f -
kustomize build environments/prod | kubectl apply -f -
```

### Managing Secrets

**Option 1: kubectl create secret (quickest)**

```bash
kubectl create secret generic blockguardian-secrets \
  --from-literal=database-url='postgresql://user:pass@host:5432/db' \
  --from-literal=jwt-secret='your-jwt-secret-here' \
  --from-literal=api-key='your-api-key-here' \
  -n default
```

**Option 2: Kustomize secretGenerator (in overlays)**

```yaml
# kubernetes/environments/prod/kustomization.yaml
secretGenerator:
    - name: blockguardian-secrets
      literals:
          - database-url=postgresql://user:pass@host:5432/db
          - jwt-secret=actual-jwt-secret
```

**Option 3: External Secrets Operator (recommended for production)**

Install External Secrets Operator and configure with AWS Secrets Manager, Vault, or other secret backends.

### Validate Kubernetes Manifests

```bash
# YAML syntax
yamllint -c ../.yamllint .

# Kubernetes schema validation
find base -name "*-fixed.yaml" -exec kubeval {} \;

# Dry run apply
kubectl apply --dry-run=client -f base/

# Check Kustomize builds
kustomize build environments/dev > /dev/null
kustomize build environments/staging > /dev/null
kustomize build environments/prod > /dev/null
```

## Ansible Configuration

### Setup Inventory

```bash
cd ansible

# Copy example inventory
cp inventory/hosts.example.yml inventory/hosts.yml

# Edit with your server IPs
vim inventory/hosts.yml

# Test connectivity
ansible all -i inventory/hosts.yml -m ping
```

### Run Playbooks

```bash
# Syntax check
ansible-playbook playbooks/main.yml --syntax-check -i inventory/hosts.yml

# Dry run (check mode)
ansible-playbook playbooks/main.yml --check -i inventory/hosts.yml

# Run playbook
ansible-playbook playbooks/main.yml -i inventory/hosts.yml

# Run specific roles with tags
ansible-playbook playbooks/main.yml -i inventory/hosts.yml --tags security,hardening

# Run against specific hosts
ansible-playbook playbooks/main.yml -i inventory/hosts.yml --limit webservers
```

### Validate Ansible

```bash
# Lint playbooks
ansible-lint playbooks/main.yml

# YAML lint
yamllint .

# Syntax check
ansible-playbook playbooks/main.yml --syntax-check -i inventory/hosts.yml
```

## CI/CD

### GitHub Actions

The repository includes two CI/CD workflows:

1. **Application CI/CD** (`ci-cd/ci-cd.yml`): Tests backend, blockchain, and frontend
2. **Infrastructure CI/CD** (`ci-cd/infrastructure-ci-cd.yml`): Validates infrastructure code

### Required GitHub Secrets

```bash
# For infrastructure deployments, configure these secrets in GitHub:
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
KUBECONFIG  # Base64 encoded kubeconfig
ANSIBLE_VAULT_PASSWORD  # If using Ansible Vault
```

### Local CI Testing

```bash
# Install act (GitHub Actions local runner)
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflows locally
act -j terraform-validate
act -j kubernetes-validate
act -j ansible-validate
```

## Validation & Testing

### Run All Validations

```bash
# Create validation script
cat > scripts/validate-all.sh << 'EOF'
#!/bin/bash
set -e

echo "=== Terraform Validation ==="
cd terraform
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
tflint --init
tflint
tfsec .
cd ..

echo "=== Kubernetes Validation ==="
cd kubernetes
yamllint -c ../.yamllint .
kustomize build environments/dev > /dev/null
kustomize build environments/staging > /dev/null
kustomize build environments/prod > /dev/null
find base -name "*-fixed.yaml" -exec kubeval {} \; || echo "kubeval done"
cd ..

echo "=== Ansible Validation ==="
cd ansible
ansible-lint playbooks/main.yml || echo "ansible-lint done"
yamllint .
ansible-playbook playbooks/main.yml --syntax-check -i inventory/hosts.example.yml
cd ..

echo "=== All validations passed ==="
EOF

chmod +x scripts/validate-all.sh
./scripts/validate-all.sh
```

### Validation Logs

Run validations and capture logs:

```bash
mkdir -p validation_logs

# Terraform
cd terraform
terraform fmt -recursive 2>&1 | tee ../validation_logs/terraform_fmt.log
terraform validate 2>&1 | tee ../validation_logs/terraform_validate.log
tflint 2>&1 | tee ../validation_logs/tflint.log
tfsec . 2>&1 | tee ../validation_logs/tfsec.log
cd ..

# Kubernetes
cd kubernetes
kustomize build environments/dev 2>&1 | tee ../validation_logs/kustomize_dev.log
kustomize build environments/staging 2>&1 | tee ../validation_logs/kustomize_staging.log
cd ..

# Ansible
cd ansible
ansible-lint playbooks/main.yml 2>&1 | tee ../validation_logs/ansible_lint.log
cd ..
```

## Security & Secrets

### Secrets Management Best Practices

1. **NEVER commit secrets to Git**
    - Use `.gitignore` to exclude `*.tfvars`, `*.vault`, `*-secrets.yaml`
    - Verify: `git status` should not show secret files

2. **Use environment variables**

    ```bash
    export TF_VAR_db_password="secure-password"
    export ANSIBLE_VAULT_PASSWORD="vault-password"
    ```

3. **Use secret management services**
    - AWS Secrets Manager
    - HashiCorp Vault
    - Kubernetes External Secrets Operator

4. **Encrypt secrets at rest**
    - Terraform: Use AWS KMS for sensitive variables
    - Ansible: Use `ansible-vault`
    - Kubernetes: Use Sealed Secrets or External Secrets

### Ansible Vault Example

```bash
# Create vault file
ansible-vault create ansible/vars/secrets.yml

# Edit vault file
ansible-vault edit ansible/vars/secrets.yml

# Run playbook with vault
ansible-playbook playbooks/main.yml --ask-vault-pass
```

## Troubleshooting

### Terraform Issues

```bash
# State lock errors
terraform force-unlock LOCK_ID

# Provider download issues
terraform init -upgrade

# Refresh state
terraform refresh

# Import existing resources
terraform import aws_instance.example i-1234567890abcdef0
```

### Kubernetes Issues

```bash
# Check pod status
kubectl get pods -A
kubectl describe pod POD_NAME -n NAMESPACE
kubectl logs POD_NAME -n NAMESPACE -f

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Validate resource definitions
kubectl explain deployment.spec.template.spec.containers

# Delete and recreate resources
kubectl delete -f file.yaml
kubectl apply -f file.yaml
```

### Ansible Issues

```bash
# Increase verbosity
ansible-playbook playbooks/main.yml -vvv

# Test specific tasks
ansible-playbook playbooks/main.yml --step

# Check syntax
ansible-playbook playbooks/main.yml --syntax-check

# List tasks
ansible-playbook playbooks/main.yml --list-tasks
```
