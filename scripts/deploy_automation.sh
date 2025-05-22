#!/bin/bash

# Deployment Automation Script for BlockGuardian
# This script automates the deployment process for BlockGuardian components
# It handles building, testing, and deploying the application to various environments

# Set colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Deployment logs directory
DEPLOY_LOG_DIR="${PROJECT_ROOT}/deployment-logs"
mkdir -p "$DEPLOY_LOG_DIR"

# Log file
LOG_FILE="${DEPLOY_LOG_DIR}/deployment_$(date +%Y%m%d_%H%M%S).log"
SUMMARY_FILE="${DEPLOY_LOG_DIR}/deployment_summary_$(date +%Y%m%d_%H%M%S).md"

# Default environment
ENVIRONMENT="development"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to log messages
log_message() {
  local message="$1"
  local level="${2:-INFO}"
  local timestamp=$(date +"%Y-%m-%d %H:%M:%S")
  echo -e "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Function to display usage information
show_usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  -e, --environment ENV    Specify deployment environment (development, staging, production)"
  echo "  -c, --component COMP     Deploy specific component (backend, web-frontend, mobile-frontend, blockchain)"
  echo "  -s, --skip-tests         Skip running tests before deployment"
  echo "  -h, --help               Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 --environment production                # Deploy all components to production"
  echo "  $0 --component backend --environment staging   # Deploy only backend to staging"
}

# Parse command line arguments
parse_arguments() {
  SKIP_TESTS=false
  COMPONENT="all"
  
  while [[ $# -gt 0 ]]; do
    case "$1" in
      -e|--environment)
        ENVIRONMENT="$2"
        shift 2
        ;;
      -c|--component)
        COMPONENT="$2"
        shift 2
        ;;
      -s|--skip-tests)
        SKIP_TESTS=true
        shift
        ;;
      -h|--help)
        show_usage
        exit 0
        ;;
      *)
        log_message "Unknown option: $1" "ERROR"
        show_usage
        exit 1
        ;;
    esac
  done
  
  # Validate environment
  if [[ ! "$ENVIRONMENT" =~ ^(development|staging|production)$ ]]; then
    log_message "Invalid environment: $ENVIRONMENT. Must be one of: development, staging, production" "ERROR"
    exit 1
  fi
  
  # Validate component
  if [[ ! "$COMPONENT" =~ ^(all|backend|web-frontend|mobile-frontend|blockchain)$ ]]; then
    log_message "Invalid component: $COMPONENT. Must be one of: all, backend, web-frontend, mobile-frontend, blockchain" "ERROR"
    exit 1
  fi
  
  log_message "Deployment configuration:" "INFO"
  log_message "- Environment: $ENVIRONMENT" "INFO"
  log_message "- Component: $COMPONENT" "INFO"
  log_message "- Skip Tests: $SKIP_TESTS" "INFO"
}

# Function to run tests for a component
run_tests() {
  local component="$1"
  local component_dir="${PROJECT_ROOT}/${component}"
  
  if [ "$SKIP_TESTS" = true ]; then
    log_message "Skipping tests for $component as requested" "INFO"
    return 0
  fi
  
  log_message "Running tests for $component..." "INFO"
  
  if [ ! -d "$component_dir" ]; then
    log_message "Component directory not found: $component_dir" "ERROR"
    return 1
  fi
  
  cd "$component_dir" || { log_message "Failed to change to directory: $component_dir" "ERROR"; return 1; }
  
  case "$component" in
    backend)
      if [ -d "venv" ]; then
        source venv/bin/activate
        python -m pytest tests/ > "${DEPLOY_LOG_DIR}/${component}_tests.log" 2>&1
        local exit_code=$?
        deactivate
      else
        log_message "Python virtual environment not found for backend" "ERROR"
        return 1
      fi
      ;;
    web-frontend)
      if command_exists npm; then
        npm test > "${DEPLOY_LOG_DIR}/${component}_tests.log" 2>&1
        local exit_code=$?
      else
        log_message "npm not found, cannot run web-frontend tests" "ERROR"
        return 1
      fi
      ;;
    mobile-frontend)
      if command_exists npm; then
        npm test > "${DEPLOY_LOG_DIR}/${component}_tests.log" 2>&1
        local exit_code=$?
      else
        log_message "npm not found, cannot run mobile-frontend tests" "ERROR"
        return 1
      fi
      ;;
    blockchain)
      if command_exists npx; then
        npx hardhat test > "${DEPLOY_LOG_DIR}/${component}_tests.log" 2>&1
        local exit_code=$?
      else
        log_message "npx not found, cannot run blockchain tests" "ERROR"
        return 1
      fi
      ;;
    *)
      log_message "Unknown component: $component" "ERROR"
      return 1
      ;;
  esac
  
  if [ $exit_code -eq 0 ]; then
    log_message "Tests for $component passed" "SUCCESS"
    echo "| $component | ✅ Tests Passed | [View Logs](${DEPLOY_LOG_DIR}/${component}_tests.log) |" >> "$SUMMARY_FILE"
    return 0
  else
    log_message "Tests for $component failed with exit code $exit_code" "ERROR"
    echo "| $component | ❌ Tests Failed | [View Logs](${DEPLOY_LOG_DIR}/${component}_tests.log) |" >> "$SUMMARY_FILE"
    return 1
  fi
}

# Function to build a component
build_component() {
  local component="$1"
  local component_dir="${PROJECT_ROOT}/${component}"
  
  log_message "Building $component for $ENVIRONMENT environment..." "INFO"
  
  if [ ! -d "$component_dir" ]; then
    log_message "Component directory not found: $component_dir" "ERROR"
    return 1
  fi
  
  cd "$component_dir" || { log_message "Failed to change to directory: $component_dir" "ERROR"; return 1; }
  
  case "$component" in
    backend)
      # For backend, we might just need to collect static files or compile some resources
      if [ -d "venv" ]; then
        source venv/bin/activate
        # Example: python manage.py collectstatic --noinput
        log_message "Backend build step completed" "SUCCESS"
        deactivate
        echo "| $component | ✅ Build Successful | No build artifacts |" >> "$SUMMARY_FILE"
        return 0
      else
        log_message "Python virtual environment not found for backend" "ERROR"
        echo "| $component | ❌ Build Failed | Virtual environment not found |" >> "$SUMMARY_FILE"
        return 1
      fi
      ;;
    web-frontend)
      if command_exists npm; then
        # Set environment-specific variables
        export REACT_APP_ENV="$ENVIRONMENT"
        export REACT_APP_API_URL="https://api.blockguardian.example.com"
        if [ "$ENVIRONMENT" = "production" ]; then
          export REACT_APP_API_URL="https://api.blockguardian.com"
        elif [ "$ENVIRONMENT" = "staging" ]; then
          export REACT_APP_API_URL="https://api-staging.blockguardian.com"
        fi
        
        # Build the application
        npm run build > "${DEPLOY_LOG_DIR}/${component}_build.log" 2>&1
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
          log_message "Web frontend build successful" "SUCCESS"
          echo "| $component | ✅ Build Successful | [View Logs](${DEPLOY_LOG_DIR}/${component}_build.log) |" >> "$SUMMARY_FILE"
          return 0
        else
          log_message "Web frontend build failed with exit code $exit_code" "ERROR"
          echo "| $component | ❌ Build Failed | [View Logs](${DEPLOY_LOG_DIR}/${component}_build.log) |" >> "$SUMMARY_FILE"
          return 1
        fi
      else
        log_message "npm not found, cannot build web-frontend" "ERROR"
        echo "| $component | ❌ Build Failed | npm not found |" >> "$SUMMARY_FILE"
        return 1
      fi
      ;;
    mobile-frontend)
      if command_exists npm; then
        # Set environment-specific variables
        export REACT_NATIVE_APP_ENV="$ENVIRONMENT"
        export REACT_NATIVE_API_URL="https://api.blockguardian.example.com"
        if [ "$ENVIRONMENT" = "production" ]; then
          export REACT_NATIVE_API_URL="https://api.blockguardian.com"
        elif [ "$ENVIRONMENT" = "staging" ]; then
          export REACT_NATIVE_API_URL="https://api-staging.blockguardian.com"
        fi
        
        # Build the application
        npm run build > "${DEPLOY_LOG_DIR}/${component}_build.log" 2>&1
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
          log_message "Mobile frontend build successful" "SUCCESS"
          echo "| $component | ✅ Build Successful | [View Logs](${DEPLOY_LOG_DIR}/${component}_build.log) |" >> "$SUMMARY_FILE"
          return 0
        else
          log_message "Mobile frontend build failed with exit code $exit_code" "ERROR"
          echo "| $component | ❌ Build Failed | [View Logs](${DEPLOY_LOG_DIR}/${component}_build.log) |" >> "$SUMMARY_FILE"
          return 1
        fi
      else
        log_message "npm not found, cannot build mobile-frontend" "ERROR"
        echo "| $component | ❌ Build Failed | npm not found |" >> "$SUMMARY_FILE"
        return 1
      fi
      ;;
    blockchain)
      if command_exists npx; then
        # Compile smart contracts
        npx hardhat compile > "${DEPLOY_LOG_DIR}/${component}_build.log" 2>&1
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
          log_message "Blockchain contracts compilation successful" "SUCCESS"
          echo "| $component | ✅ Build Successful | [View Logs](${DEPLOY_LOG_DIR}/${component}_build.log) |" >> "$SUMMARY_FILE"
          return 0
        else
          log_message "Blockchain contracts compilation failed with exit code $exit_code" "ERROR"
          echo "| $component | ❌ Build Failed | [View Logs](${DEPLOY_LOG_DIR}/${component}_build.log) |" >> "$SUMMARY_FILE"
          return 1
        fi
      else
        log_message "npx not found, cannot build blockchain contracts" "ERROR"
        echo "| $component | ❌ Build Failed | npx not found |" >> "$SUMMARY_FILE"
        return 1
      fi
      ;;
    *)
      log_message "Unknown component: $component" "ERROR"
      echo "| $component | ❌ Build Failed | Unknown component |" >> "$SUMMARY_FILE"
      return 1
      ;;
  esac
}

# Function to deploy a component
deploy_component() {
  local component="$1"
  local component_dir="${PROJECT_ROOT}/${component}"
  
  log_message "Deploying $component to $ENVIRONMENT environment..." "INFO"
  
  if [ ! -d "$component_dir" ]; then
    log_message "Component directory not found: $component_dir" "ERROR"
    return 1
  fi
  
  cd "$component_dir" || { log_message "Failed to change to directory: $component_dir" "ERROR"; return 1; }
  
  case "$component" in
    backend)
      # Example deployment steps for backend
      if [ "$ENVIRONMENT" = "production" ]; then
        log_message "Deploying backend to production server..." "INFO"
        # Example: rsync -avz --exclude 'venv' --exclude '*.pyc' . user@production-server:/path/to/deployment/
        echo "| $component | ✅ Deployment Simulated | Production deployment would happen here |" >> "$SUMMARY_FILE"
      elif [ "$ENVIRONMENT" = "staging" ]; then
        log_message "Deploying backend to staging server..." "INFO"
        # Example: rsync -avz --exclude 'venv' --exclude '*.pyc' . user@staging-server:/path/to/deployment/
        echo "| $component | ✅ Deployment Simulated | Staging deployment would happen here |" >> "$SUMMARY_FILE"
      else
        log_message "Deploying backend to development server..." "INFO"
        # Example: Local deployment or to a development server
        echo "| $component | ✅ Deployment Simulated | Development deployment would happen here |" >> "$SUMMARY_FILE"
      fi
      ;;
    web-frontend)
      # Example deployment steps for web frontend
      if [ -d "build" ]; then
        if [ "$ENVIRONMENT" = "production" ]; then
          log_message "Deploying web frontend to production CDN..." "INFO"
          # Example: aws s3 sync build/ s3://blockguardian-production-frontend/
          echo "| $component | ✅ Deployment Simulated | Production deployment would happen here |" >> "$SUMMARY_FILE"
        elif [ "$ENVIRONMENT" = "staging" ]; then
          log_message "Deploying web frontend to staging CDN..." "INFO"
          # Example: aws s3 sync build/ s3://blockguardian-staging-frontend/
          echo "| $component | ✅ Deployment Simulated | Staging deployment would happen here |" >> "$SUMMARY_FILE"
        else
          log_message "Deploying web frontend to development server..." "INFO"
          # Example: Local deployment or to a development server
          echo "| $component | ✅ Deployment Simulated | Development deployment would happen here |" >> "$SUMMARY_FILE"
        fi
      else
        log_message "Build directory not found for web frontend" "ERROR"
        echo "| $component | ❌ Deployment Failed | Build directory not found |" >> "$SUMMARY_FILE"
        return 1
      fi
      ;;
    mobile-frontend)
      # For mobile frontend, we might just build and prepare for app store submission
      log_message "Mobile frontend deployment prepared for $ENVIRONMENT" "SUCCESS"
      echo "| $component | ✅ Deployment Simulated | Mobile app would be submitted to app stores |" >> "$SUMMARY_FILE"
      ;;
    blockchain)
      # Example deployment steps for blockchain contracts
      if [ "$ENVIRONMENT" = "production" ]; then
        log_message "Deploying blockchain contracts to mainnet..." "INFO"
        # Example: npx hardhat run scripts/deploy.js --network mainnet
        echo "| $component | ✅ Deployment Simulated | Mainnet deployment would happen here |" >> "$SUMMARY_FILE"
      elif [ "$ENVIRONMENT" = "staging" ]; then
        log_message "Deploying blockchain contracts to testnet..." "INFO"
        # Example: npx hardhat run scripts/deploy.js --network testnet
        echo "| $component | ✅ Deployment Simulated | Testnet deployment would happen here |" >> "$SUMMARY_FILE"
      else
        log_message "Deploying blockchain contracts to local network..." "INFO"
        # Example: npx hardhat run scripts/deploy.js --network localhost
        echo "| $component | ✅ Deployment Simulated | Local network deployment would happen here |" >> "$SUMMARY_FILE"
      fi
      ;;
    *)
      log_message "Unknown component: $component" "ERROR"
      echo "| $component | ❌ Deployment Failed | Unknown component |" >> "$SUMMARY_FILE"
      return 1
      ;;
  esac
  
  log_message "Deployment of $component to $ENVIRONMENT completed successfully" "SUCCESS"
  return 0
}

# Main deployment function
deploy() {
  log_message "Starting deployment process for BlockGuardian" "INFO"
  echo -e "${BLUE}========== BlockGuardian Deployment ==========${NC}"
  
  # Create summary file header
  echo "# BlockGuardian Deployment Summary" > "$SUMMARY_FILE"
  echo "Generated on: $(date)" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "## Deployment Configuration" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "- **Environment:** $ENVIRONMENT" >> "$SUMMARY_FILE"
  echo "- **Component:** $COMPONENT" >> "$SUMMARY_FILE"
  echo "- **Skip Tests:** $SKIP_TESTS" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "## Deployment Results" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "| Component | Status | Details |" >> "$SUMMARY_FILE"
  echo "|-----------|--------|---------|" >> "$SUMMARY_FILE"
  
  # Initialize counters
  local success_count=0
  local failure_count=0
  
  # Deploy specific component or all components
  if [ "$COMPONENT" = "all" ]; then
    components=("backend" "web-frontend" "mobile-frontend" "blockchain")
    
    for component in "${components[@]}"; do
      echo -e "${BLUE}Processing $component...${NC}"
      
      # Run tests
      if ! run_tests "$component"; then
        log_message "Tests failed for $component, skipping deployment" "ERROR"
        ((failure_count++))
        continue
      fi
      
      # Build component
      if ! build_component "$component"; then
        log_message "Build failed for $component, skipping deployment" "ERROR"
        ((failure_count++))
        continue
      fi
      
      # Deploy component
      if deploy_component "$component"; then
        ((success_count++))
      else
        ((failure_count++))
      fi
    done
  else
    echo -e "${BLUE}Processing $COMPONENT...${NC}"
    
    # Run tests
    if ! run_tests "$COMPONENT"; then
      log_message "Tests failed for $COMPONENT, skipping deployment" "ERROR"
      ((failure_count++))
    else
      # Build component
      if ! build_component "$COMPONENT"; then
        log_message "Build failed for $COMPONENT, skipping deployment" "ERROR"
        ((failure_count++))
      else
        # Deploy component
        if deploy_component "$COMPONENT"; then
          ((success_count++))
        else
          ((failure_count++))
        fi
      fi
    fi
  fi
  
  # Add summary statistics
  echo "" >> "$SUMMARY_FILE"
  echo "## Summary Statistics" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "- **Successful Deployments:** $success_count" >> "$SUMMARY_FILE"
  echo "- **Failed Deployments:** $failure_count" >> "$SUMMARY_FILE"
  echo "- **Total Components:** $((success_count + failure_count))" >> "$SUMMARY_FILE"
  echo "- **Deployment Log:** $LOG_FILE" >> "$SUMMARY_FILE"
  
  # Print summary to console
  echo -e "${BLUE}========== Deployment Summary ==========${NC}"
  echo -e "${GREEN}Successful Deployments: $success_count${NC}"
  echo -e "${RED}Failed Deployments: $failure_count${NC}"
  echo -e "${BLUE}Total Components: $((success_count + failure_count))${NC}"
  
  log_message "Deployment process completed. Results saved to $SUMMARY_FILE" "INFO"
  
  # Return non-zero exit code if any deployments failed
  if [ $failure_count -gt 0 ]; then
    return 1
  else
    return 0
  fi
}

# Parse command line arguments
parse_arguments "$@"

# Run deployment
deploy
exit_code=$?

# Return the exit code
exit $exit_code
