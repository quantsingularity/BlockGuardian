#!/bin/bash

# Health Check Script for BlockGuardian
# This script checks the health of all running BlockGuardian components
# and provides a consolidated status report

# Set colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Health check results directory
HEALTH_CHECK_DIR="${PROJECT_ROOT}/health-checks"
mkdir -p "$HEALTH_CHECK_DIR"

# Log file
LOG_FILE="${HEALTH_CHECK_DIR}/health_check_$(date +%Y%m%d_%H%M%S).log"
SUMMARY_FILE="${HEALTH_CHECK_DIR}/health_summary_$(date +%Y%m%d_%H%M%S).md"

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

# Function to check if a port is in use
check_port() {
  local port="$1"
  local service_name="$2"
  
  if command_exists nc; then
    nc -z localhost "$port" > /dev/null 2>&1
    return $?
  elif command_exists lsof; then
    lsof -i:"$port" > /dev/null 2>&1
    return $?
  else
    log_message "Neither nc nor lsof found, cannot check port $port" "WARNING"
    return 2
  fi
}

# Function to check a specific service
check_service() {
  local service_name="$1"
  local check_command="$2"
  local service_dir="${3:-}"
  local expected_output="${4:-}"
  
  log_message "Checking service: $service_name" "INFO"
  
  # Change to service directory if provided
  if [ -n "$service_dir" ] && [ -d "$service_dir" ]; then
    cd "$service_dir" || { log_message "Failed to change to directory: $service_dir" "ERROR"; return 1; }
  fi
  
  # Execute the check command
  log_message "Executing: $check_command" "DEBUG"
  local output
  output=$(eval "$check_command" 2>&1)
  local exit_code=$?
  
  # Save output to file
  echo "$output" > "${HEALTH_CHECK_DIR}/${service_name}_health.log"
  
  # Check if command was successful
  if [ $exit_code -eq 0 ]; then
    # If expected output is provided, check if it's in the actual output
    if [ -n "$expected_output" ]; then
      if echo "$output" | grep -q "$expected_output"; then
        log_message "Service $service_name is healthy" "SUCCESS"
        echo -e "${GREEN}✓ $service_name is healthy${NC}"
        return 0
      else
        log_message "Service $service_name returned unexpected output" "ERROR"
        echo -e "${RED}✗ $service_name returned unexpected output${NC}"
        return 1
      fi
    else
      log_message "Service $service_name is healthy" "SUCCESS"
      echo -e "${GREEN}✓ $service_name is healthy${NC}"
      return 0
    fi
  else
    log_message "Service $service_name is unhealthy (exit code: $exit_code)" "ERROR"
    echo -e "${RED}✗ $service_name is unhealthy${NC}"
    return 1
  fi
}

# Function to check backend service
check_backend() {
  local backend_dir="${PROJECT_ROOT}/backend"
  local backend_port=8000  # Default FastAPI port
  
  if [ ! -d "$backend_dir" ]; then
    log_message "Backend directory not found: $backend_dir" "ERROR"
    echo "| Backend | ⚠️ Not Found | Directory not found |" >> "$SUMMARY_FILE"
    return 2
  fi
  
  # Check if backend service is running on expected port
  if check_port "$backend_port" "backend"; then
    # Try to access health endpoint if it exists
    if curl -s "http://localhost:${backend_port}/health" > /dev/null 2>&1; then
      check_service "backend" "curl -s http://localhost:${backend_port}/health" "" "\"status\":\"healthy\""
      local status=$?
      if [ $status -eq 0 ]; then
        echo "| Backend | ✅ Healthy | Running on port $backend_port |" >> "$SUMMARY_FILE"
      else
        echo "| Backend | ❌ Unhealthy | API health check failed |" >> "$SUMMARY_FILE"
      fi
      return $status
    else
      # Just check if the service responds
      check_service "backend" "curl -s http://localhost:${backend_port}"
      local status=$?
      if [ $status -eq 0 ]; then
        echo "| Backend | ✅ Healthy | Running on port $backend_port |" >> "$SUMMARY_FILE"
      else
        echo "| Backend | ❌ Unhealthy | Service not responding |" >> "$SUMMARY_FILE"
      fi
      return $status
    fi
  else
    log_message "Backend service not running on port $backend_port" "ERROR"
    echo "| Backend | ❌ Not Running | Port $backend_port not in use |" >> "$SUMMARY_FILE"
    return 1
  fi
}

# Function to check blockchain node
check_blockchain_node() {
  local blockchain_dir="${PROJECT_ROOT}/blockchain"
  local blockchain_port=8545  # Default Ethereum node port
  
  if [ ! -d "$blockchain_dir" ]; then
    log_message "Blockchain directory not found: $blockchain_dir" "ERROR"
    echo "| Blockchain Node | ⚠️ Not Found | Directory not found |" >> "$SUMMARY_FILE"
    return 2
  fi
  
  # Check if blockchain node is running on expected port
  if check_port "$blockchain_port" "blockchain"; then
    # Try to access JSON-RPC endpoint
    check_service "blockchain" "curl -s -X POST -H 'Content-Type: application/json' --data '{\"jsonrpc\":\"2.0\",\"method\":\"web3_clientVersion\",\"params\":[],\"id\":1}' http://localhost:${blockchain_port}"
    local status=$?
    if [ $status -eq 0 ]; then
      echo "| Blockchain Node | ✅ Healthy | Running on port $blockchain_port |" >> "$SUMMARY_FILE"
    else
      echo "| Blockchain Node | ❌ Unhealthy | JSON-RPC check failed |" >> "$SUMMARY_FILE"
    fi
    return $status
  else
    log_message "Blockchain node not running on port $blockchain_port" "ERROR"
    echo "| Blockchain Node | ❌ Not Running | Port $blockchain_port not in use |" >> "$SUMMARY_FILE"
    return 1
  fi
}

# Function to check web frontend
check_web_frontend() {
  local web_frontend_dir="${PROJECT_ROOT}/web-frontend"
  local web_frontend_port=3000  # Default React port
  
  if [ ! -d "$web_frontend_dir" ]; then
    log_message "Web frontend directory not found: $web_frontend_dir" "ERROR"
    echo "| Web Frontend | ⚠️ Not Found | Directory not found |" >> "$SUMMARY_FILE"
    return 2
  fi
  
  # Check if web frontend is running on expected port
  if check_port "$web_frontend_port" "web-frontend"; then
    check_service "web-frontend" "curl -s http://localhost:${web_frontend_port}"
    local status=$?
    if [ $status -eq 0 ]; then
      echo "| Web Frontend | ✅ Healthy | Running on port $web_frontend_port |" >> "$SUMMARY_FILE"
    else
      echo "| Web Frontend | ❌ Unhealthy | Service not responding |" >> "$SUMMARY_FILE"
    fi
    return $status
  else
    log_message "Web frontend not running on port $web_frontend_port" "ERROR"
    echo "| Web Frontend | ❌ Not Running | Port $web_frontend_port not in use |" >> "$SUMMARY_FILE"
    return 1
  fi
}

# Function to check database
check_database() {
  local db_port=5432  # Default PostgreSQL port
  
  # Check if PostgreSQL is running
  if check_port "$db_port" "database"; then
    if command_exists psql; then
      check_service "database" "psql -h localhost -p $db_port -U postgres -c 'SELECT 1;'" "" "1 row"
      local status=$?
      if [ $status -eq 0 ]; then
        echo "| Database | ✅ Healthy | PostgreSQL running on port $db_port |" >> "$SUMMARY_FILE"
      else
        echo "| Database | ❌ Unhealthy | PostgreSQL connection failed |" >> "$SUMMARY_FILE"
      fi
      return $status
    else
      log_message "psql command not found, cannot check PostgreSQL" "WARNING"
      echo "| Database | ⚠️ Unknown | psql command not found |" >> "$SUMMARY_FILE"
      return 2
    fi
  else
    # Check if MongoDB is running (alternative database)
    local mongo_port=27017
    if check_port "$mongo_port" "database"; then
      if command_exists mongosh; then
        check_service "database" "mongosh --quiet --eval 'db.runCommand({ ping: 1 })'" "" "{ ok: 1 }"
        local status=$?
        if [ $status -eq 0 ]; then
          echo "| Database | ✅ Healthy | MongoDB running on port $mongo_port |" >> "$SUMMARY_FILE"
        else
          echo "| Database | ❌ Unhealthy | MongoDB connection failed |" >> "$SUMMARY_FILE"
        fi
        return $status
      else
        log_message "mongosh command not found, cannot check MongoDB" "WARNING"
        echo "| Database | ⚠️ Unknown | mongosh command not found |" >> "$SUMMARY_FILE"
        return 2
      fi
    else
      log_message "No database service detected" "ERROR"
      echo "| Database | ❌ Not Running | No database service detected |" >> "$SUMMARY_FILE"
      return 1
    fi
  fi
}

# Function to check Redis cache
check_redis() {
  local redis_port=6379  # Default Redis port
  
  # Check if Redis is running
  if check_port "$redis_port" "redis"; then
    if command_exists redis-cli; then
      check_service "redis" "redis-cli -h localhost -p $redis_port ping" "" "PONG"
      local status=$?
      if [ $status -eq 0 ]; then
        echo "| Redis Cache | ✅ Healthy | Running on port $redis_port |" >> "$SUMMARY_FILE"
      else
        echo "| Redis Cache | ❌ Unhealthy | Connection failed |" >> "$SUMMARY_FILE"
      fi
      return $status
    else
      log_message "redis-cli command not found, cannot check Redis" "WARNING"
      echo "| Redis Cache | ⚠️ Unknown | redis-cli command not found |" >> "$SUMMARY_FILE"
      return 2
    fi
  else
    log_message "Redis not running on port $redis_port" "WARNING"
    echo "| Redis Cache | ⚠️ Not Running | Port $redis_port not in use |" >> "$SUMMARY_FILE"
    return 2
  fi
}

# Function to check Docker containers
check_docker_containers() {
  if command_exists docker; then
    # Check if Docker is running
    if docker info > /dev/null 2>&1; then
      # Get list of running containers related to BlockGuardian
      local containers
      containers=$(docker ps --filter "name=blockguardian" --format "{{.Names}}")
      
      if [ -z "$containers" ]; then
        log_message "No BlockGuardian Docker containers running" "WARNING"
        echo "| Docker Containers | ⚠️ Not Running | No BlockGuardian containers found |" >> "$SUMMARY_FILE"
        return 2
      else
        local container_count
        container_count=$(echo "$containers" | wc -l)
        log_message "$container_count BlockGuardian Docker containers running" "INFO"
        echo "| Docker Containers | ✅ Running | $container_count containers active |" >> "$SUMMARY_FILE"
        
        # Add container details to log
        docker ps --filter "name=blockguardian" > "${HEALTH_CHECK_DIR}/docker_containers.log"
        return 0
      fi
    else
      log_message "Docker daemon is not running" "ERROR"
      echo "| Docker Containers | ❌ Error | Docker daemon not running |" >> "$SUMMARY_FILE"
      return 1
    fi
  else
    log_message "Docker command not found" "WARNING"
    echo "| Docker Containers | ⚠️ Unknown | Docker command not found |" >> "$SUMMARY_FILE"
    return 2
  fi
}

# Function to check disk space
check_disk_space() {
  local threshold=90  # Warning threshold percentage
  
  # Get disk usage percentage
  local disk_usage
  disk_usage=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
  
  if [ "$disk_usage" -lt "$threshold" ]; then
    log_message "Disk space usage: $disk_usage% (below threshold of $threshold%)" "INFO"
    echo "| Disk Space | ✅ OK | $disk_usage% used (threshold: $threshold%) |" >> "$SUMMARY_FILE"
    return 0
  else
    log_message "Disk space usage: $disk_usage% (exceeds threshold of $threshold%)" "WARNING"
    echo "| Disk Space | ⚠️ Warning | $disk_usage% used (threshold: $threshold%) |" >> "$SUMMARY_FILE"
    return 2
  fi
}

# Main function to run all health checks
run_health_checks() {
  log_message "Starting health checks for BlockGuardian" "INFO"
  echo -e "${BLUE}========== BlockGuardian Health Check ==========${NC}"
  
  # Initialize counters
  local healthy=0
  local unhealthy=0
  local warnings=0
  
  # Create health summary header
  echo "# BlockGuardian Health Check Summary" > "$SUMMARY_FILE"
  echo "Generated on: $(date)" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "## Service Status" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "| Service | Status | Details |" >> "$SUMMARY_FILE"
  echo "|---------|--------|---------|" >> "$SUMMARY_FILE"
  
  # Run individual health checks
  echo -e "${BLUE}Checking backend service...${NC}"
  check_backend
  case $? in
    0) ((healthy++)) ;;
    1) ((unhealthy++)) ;;
    2) ((warnings++)) ;;
  esac
  
  echo -e "${BLUE}Checking blockchain node...${NC}"
  check_blockchain_node
  case $? in
    0) ((healthy++)) ;;
    1) ((unhealthy++)) ;;
    2) ((warnings++)) ;;
  esac
  
  echo -e "${BLUE}Checking web frontend...${NC}"
  check_web_frontend
  case $? in
    0) ((healthy++)) ;;
    1) ((unhealthy++)) ;;
    2) ((warnings++)) ;;
  esac
  
  echo -e "${BLUE}Checking database...${NC}"
  check_database
  case $? in
    0) ((healthy++)) ;;
    1) ((unhealthy++)) ;;
    2) ((warnings++)) ;;
  esac
  
  echo -e "${BLUE}Checking Redis cache...${NC}"
  check_redis
  case $? in
    0) ((healthy++)) ;;
    1) ((unhealthy++)) ;;
    2) ((warnings++)) ;;
  esac
  
  echo -e "${BLUE}Checking Docker containers...${NC}"
  check_docker_containers
  case $? in
    0) ((healthy++)) ;;
    1) ((unhealthy++)) ;;
    2) ((warnings++)) ;;
  esac
  
  echo -e "${BLUE}Checking disk space...${NC}"
  check_disk_space
  case $? in
    0) ((healthy++)) ;;
    1) ((unhealthy++)) ;;
    2) ((warnings++)) ;;
  esac
  
  # Add summary statistics
  echo "" >> "$SUMMARY_FILE"
  echo "## Summary Statistics" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "- **Healthy Services:** $healthy" >> "$SUMMARY_FILE"
  echo "- **Unhealthy Services:** $unhealthy" >> "$SUMMARY_FILE"
  echo "- **Warnings:** $warnings" >> "$SUMMARY_FILE"
  echo "- **Total Checks:** $((healthy + unhealthy + warnings))" >> "$SUMMARY_FILE"
  
  # Print summary to console
  echo -e "${BLUE}========== Health Check Summary ==========${NC}"
  echo -e "${GREEN}Healthy Services: $healthy${NC}"
  echo -e "${RED}Unhealthy Services: $unhealthy${NC}"
  echo -e "${YELLOW}Warnings: $warnings${NC}"
  echo -e "${BLUE}Total Checks: $((healthy + unhealthy + warnings))${NC}"
  
  log_message "Health check completed. Results saved to $SUMMARY_FILE" "INFO"
  
  # Return non-zero exit code if any services are unhealthy
  if [ $unhealthy -gt 0 ]; then
    return 1
  else
    return 0
  fi
}

# Run all health checks
run_health_checks
exit_code=$?

# Return the exit code
exit $exit_code
