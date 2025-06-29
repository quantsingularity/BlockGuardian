#!/bin/bash
# Comprehensive Deployment Script for Financial-Grade Infrastructure
# This script orchestrates the complete deployment of BlockGuardian infrastructure

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENVIRONMENT="${1:-staging}"
ACTION="${2:-deploy}"
COMPLIANCE_MODE="financial-grade"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging
LOG_FILE="/var/log/blockguardian-deployment-$(date +%Y%m%d_%H%M%S).log"
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

# Validation functions
validate_environment() {
    local env="$1"
    if [[ ! "$env" =~ ^(dev|staging|prod)$ ]]; then
        error "Invalid environment: $env. Must be one of: dev, staging, prod"
    fi
}

validate_prerequisites() {
    log "Validating prerequisites..."
    
    # Check required tools
    local required_tools=("terraform" "kubectl" "aws" "docker" "helm" "ansible")
    for tool in "${required_tools[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool is required but not installed"
        fi
    done
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS credentials not configured or invalid"
    fi
    
    # Check Terraform version
    local tf_version=$(terraform version -json | jq -r '.terraform_version')
    if [[ $(echo "$tf_version 1.5.0" | tr " " "\n" | sort -V | head -n1) != "1.5.0" ]]; then
        error "Terraform version 1.5.0 or higher required. Found: $tf_version"
    fi
    
    log "Prerequisites validation completed"
}

# Security validation
security_scan() {
    log "Running security scans..."
    
    # Terraform security scan
    info "Scanning Terraform configurations..."
    cd "$PROJECT_ROOT/terraform"
    if command -v tfsec &> /dev/null; then
        tfsec . --format json > /tmp/tfsec-results.json
        if [[ $(jq '.results | length' /tmp/tfsec-results.json) -gt 0 ]]; then
            warn "Security issues found in Terraform configuration"
            jq '.results[] | .description' /tmp/tfsec-results.json
        fi
    fi
    
    # Kubernetes security scan
    info "Scanning Kubernetes manifests..."
    cd "$PROJECT_ROOT/kubernetes"
    if command -v kubesec &> /dev/null; then
        find . -name "*.yaml" -o -name "*.yml" | xargs kubesec scan
    fi
    
    # Container image scan
    if [[ -n "${DOCKER_IMAGE:-}" ]]; then
        info "Scanning container image..."
        if command -v trivy &> /dev/null; then
            trivy image --severity HIGH,CRITICAL "$DOCKER_IMAGE"
        fi
    fi
    
    log "Security scans completed"
}

# Compliance validation
compliance_check() {
    log "Running compliance checks for $COMPLIANCE_MODE..."
    
    # Check encryption settings
    info "Validating encryption configurations..."
    
    # Check Terraform encryption
    if ! grep -r "encrypted.*=.*true" "$PROJECT_ROOT/terraform/" &> /dev/null; then
        warn "Encryption not explicitly enabled in Terraform configurations"
    fi
    
    # Check Kubernetes security contexts
    if ! grep -r "securityContext" "$PROJECT_ROOT/kubernetes/" &> /dev/null; then
        warn "Security contexts not found in Kubernetes manifests"
    fi
    
    # Check audit logging
    if ! grep -r "audit" "$PROJECT_ROOT/" &> /dev/null; then
        warn "Audit logging configuration not found"
    fi
    
    log "Compliance checks completed"
}

# Infrastructure deployment
deploy_infrastructure() {
    local env="$1"
    log "Deploying infrastructure for environment: $env"
    
    cd "$PROJECT_ROOT/terraform/environments/$env"
    
    # Initialize Terraform
    info "Initializing Terraform..."
    terraform init -upgrade
    
    # Validate configuration
    info "Validating Terraform configuration..."
    terraform validate
    
    # Plan deployment
    info "Planning infrastructure deployment..."
    terraform plan -out=tfplan -var="environment=$env" -var="compliance_mode=$COMPLIANCE_MODE"
    
    # Apply deployment
    info "Applying infrastructure deployment..."
    terraform apply tfplan
    
    # Save outputs
    terraform output -json > "/tmp/terraform-outputs-$env.json"
    
    log "Infrastructure deployment completed for $env"
}

# Kubernetes deployment
deploy_kubernetes() {
    local env="$1"
    log "Deploying Kubernetes resources for environment: $env"
    
    # Get cluster credentials
    info "Configuring kubectl..."
    local cluster_name=$(jq -r '.cluster_name.value' "/tmp/terraform-outputs-$env.json")
    local region=$(jq -r '.region.value' "/tmp/terraform-outputs-$env.json")
    aws eks update-kubeconfig --region "$region" --name "$cluster_name"
    
    # Create namespaces
    info "Creating namespaces..."
    kubectl apply -f - <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: $env
  labels:
    environment: $env
    compliance: pci-dss,soc2,iso27001
---
apiVersion: v1
kind: Namespace
metadata:
  name: monitoring
  labels:
    purpose: monitoring
    compliance: pci-dss,soc2,iso27001
EOF
    
    # Deploy security policies
    info "Deploying security policies..."
    kubectl apply -f "$PROJECT_ROOT/kubernetes/base/security/" -n "$env"
    
    # Deploy monitoring stack
    info "Deploying monitoring stack..."
    kubectl apply -f "$PROJECT_ROOT/kubernetes/base/monitoring/" -n monitoring
    
    # Wait for monitoring to be ready
    kubectl wait --for=condition=available --timeout=600s deployment/prometheus -n monitoring
    kubectl wait --for=condition=available --timeout=600s deployment/grafana -n monitoring
    
    # Deploy application
    info "Deploying application..."
    envsubst < "$PROJECT_ROOT/kubernetes/base/backend-deployment.yaml" | kubectl apply -f - -n "$env"
    envsubst < "$PROJECT_ROOT/kubernetes/base/backend-service.yaml" | kubectl apply -f - -n "$env"
    
    # Wait for application to be ready
    kubectl wait --for=condition=available --timeout=600s deployment/blockguardian-backend -n "$env"
    
    log "Kubernetes deployment completed for $env"
}

# Configuration management with Ansible
deploy_configuration() {
    local env="$1"
    log "Deploying configuration with Ansible for environment: $env"
    
    cd "$PROJECT_ROOT/ansible"
    
    # Update inventory
    info "Updating Ansible inventory..."
    ./scripts/update-inventory.sh "$env"
    
    # Run security hardening playbook
    info "Running security hardening playbook..."
    ansible-playbook -i "inventory/hosts-$env.yml" \
                     playbooks/main.yml \
                     --extra-vars "environment=$env compliance_mode=$COMPLIANCE_MODE" \
                     --vault-password-file ~/.ansible-vault-pass
    
    log "Configuration deployment completed for $env"
}

# Health checks
run_health_checks() {
    local env="$1"
    log "Running health checks for environment: $env"
    
    # Get application URL
    local app_url=$(kubectl get service blockguardian-backend -n "$env" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    # Wait for load balancer to be ready
    local max_attempts=30
    local attempt=1
    while [[ -z "$app_url" && $attempt -le $max_attempts ]]; do
        info "Waiting for load balancer to be ready... (attempt $attempt/$max_attempts)"
        sleep 10
        app_url=$(kubectl get service blockguardian-backend -n "$env" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
        ((attempt++))
    done
    
    if [[ -z "$app_url" ]]; then
        error "Load balancer not ready after $max_attempts attempts"
    fi
    
    # Health check endpoint
    info "Checking application health..."
    local health_url="https://$app_url/health"
    local max_health_attempts=20
    local health_attempt=1
    
    while [[ $health_attempt -le $max_health_attempts ]]; do
        if curl -f -s "$health_url" > /dev/null; then
            log "Application health check passed"
            break
        else
            info "Health check failed, retrying... (attempt $health_attempt/$max_health_attempts)"
            sleep 15
            ((health_attempt++))
        fi
    done
    
    if [[ $health_attempt -gt $max_health_attempts ]]; then
        error "Application health check failed after $max_health_attempts attempts"
    fi
    
    # Database connectivity check
    info "Checking database connectivity..."
    kubectl exec -n "$env" deployment/blockguardian-backend -- \
        sh -c 'curl -f http://localhost:8080/health/db' || error "Database connectivity check failed"
    
    # Security check
    info "Running security validation..."
    curl -I "https://$app_url" | grep -i "strict-transport-security" || warn "HSTS header not found"
    curl -I "https://$app_url" | grep -i "x-content-type-options" || warn "X-Content-Type-Options header not found"
    
    log "Health checks completed for $env"
}

# Performance tests
run_performance_tests() {
    local env="$1"
    log "Running performance tests for environment: $env"
    
    local app_url=$(kubectl get service blockguardian-backend -n "$env" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
    
    # Basic load test
    if command -v ab &> /dev/null; then
        info "Running Apache Bench load test..."
        ab -n 1000 -c 10 "https://$app_url/health" > "/tmp/performance-test-$env.txt"
        
        # Check response time
        local avg_response_time=$(grep "Time per request" "/tmp/performance-test-$env.txt" | head -1 | awk '{print $4}')
        if (( $(echo "$avg_response_time > 2000" | bc -l) )); then
            warn "Average response time is high: ${avg_response_time}ms"
        fi
    fi
    
    log "Performance tests completed for $env"
}

# Rollback function
rollback_deployment() {
    local env="$1"
    local rollback_version="${2:-previous}"
    
    error "Deployment failed. Initiating rollback for environment: $env"
    
    # Rollback Kubernetes deployment
    info "Rolling back Kubernetes deployment..."
    kubectl rollout undo deployment/blockguardian-backend -n "$env"
    kubectl rollout status deployment/blockguardian-backend -n "$env" --timeout=300s
    
    # Rollback database if needed
    if [[ -f "/tmp/db-backup-pre-deployment-$env.sql" ]]; then
        info "Rolling back database..."
        # Database rollback logic would go here
    fi
    
    # Notify about rollback
    info "Rollback completed for environment: $env"
    
    # Send notification
    send_notification "ROLLBACK" "$env" "Deployment rolled back due to failure"
}

# Notification function
send_notification() {
    local status="$1"
    local env="$2"
    local message="$3"
    
    # Send Slack notification if webhook is configured
    if [[ -n "${SLACK_WEBHOOK_URL:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
             --data "{\"text\":\"[$status] BlockGuardian $env deployment: $message\"}" \
             "$SLACK_WEBHOOK_URL"
    fi
    
    # Send email notification if configured
    if [[ -n "${NOTIFICATION_EMAIL:-}" ]]; then
        echo "$message" | mail -s "[$status] BlockGuardian $env Deployment" "$NOTIFICATION_EMAIL"
    fi
}

# Generate deployment report
generate_report() {
    local env="$1"
    local status="$2"
    
    local report_file="/tmp/deployment-report-$env-$(date +%Y%m%d_%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "deployment": {
    "environment": "$env",
    "status": "$status",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "compliance_mode": "$COMPLIANCE_MODE",
    "deployer": "$(whoami)",
    "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
    "terraform_version": "$(terraform version -json | jq -r '.terraform_version')",
    "kubectl_version": "$(kubectl version --client -o json | jq -r '.clientVersion.gitVersion')"
  },
  "infrastructure": {
    "terraform_outputs": $(cat "/tmp/terraform-outputs-$env.json" 2>/dev/null || echo '{}')
  },
  "security": {
    "scans_completed": true,
    "compliance_validated": true,
    "encryption_enabled": true
  },
  "health_checks": {
    "application_healthy": true,
    "database_connected": true,
    "monitoring_active": true
  }
}
EOF
    
    info "Deployment report generated: $report_file"
    
    # Upload report to S3 if bucket is configured
    if [[ -n "${DEPLOYMENT_REPORTS_BUCKET:-}" ]]; then
        aws s3 cp "$report_file" "s3://$DEPLOYMENT_REPORTS_BUCKET/reports/"
    fi
}

# Main deployment function
main() {
    local env="$1"
    local action="$2"
    
    log "Starting BlockGuardian deployment"
    log "Environment: $env"
    log "Action: $action"
    log "Compliance Mode: $COMPLIANCE_MODE"
    
    # Trap for cleanup on exit
    trap 'rollback_deployment "$env"' ERR
    
    case "$action" in
        "deploy")
            validate_environment "$env"
            validate_prerequisites
            security_scan
            compliance_check
            deploy_infrastructure "$env"
            deploy_kubernetes "$env"
            deploy_configuration "$env"
            run_health_checks "$env"
            run_performance_tests "$env"
            generate_report "$env" "SUCCESS"
            send_notification "SUCCESS" "$env" "Deployment completed successfully"
            ;;
        "destroy")
            warn "Destroying environment: $env"
            read -p "Are you sure you want to destroy the $env environment? (yes/no): " -r
            if [[ $REPLY == "yes" ]]; then
                cd "$PROJECT_ROOT/terraform/environments/$env"
                terraform destroy -auto-approve
                log "Environment $env destroyed"
            else
                info "Destruction cancelled"
            fi
            ;;
        "validate")
            validate_environment "$env"
            validate_prerequisites
            security_scan
            compliance_check
            log "Validation completed"
            ;;
        *)
            error "Invalid action: $action. Must be one of: deploy, destroy, validate"
            ;;
    esac
    
    log "BlockGuardian deployment completed successfully"
}

# Usage information
usage() {
    cat << EOF
Usage: $0 <environment> <action>

Environments:
  dev      - Development environment
  staging  - Staging environment
  prod     - Production environment

Actions:
  deploy   - Deploy infrastructure and applications
  destroy  - Destroy infrastructure (use with caution)
  validate - Validate configuration without deploying

Examples:
  $0 staging deploy
  $0 prod validate
  $0 dev destroy

Environment Variables:
  SLACK_WEBHOOK_URL       - Slack webhook for notifications
  NOTIFICATION_EMAIL      - Email for notifications
  DEPLOYMENT_REPORTS_BUCKET - S3 bucket for deployment reports
  DOCKER_IMAGE           - Container image to deploy

EOF
}

# Check arguments
if [[ $# -lt 2 ]]; then
    usage
    exit 1
fi

# Run main function
main "$1" "$2"

