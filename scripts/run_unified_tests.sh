#!/bin/bash

# Unified Testing Script for BlockGuardian
# This script automates the testing process across all components of the BlockGuardian project
# It runs unit tests, integration tests, and generates a consolidated test report

# Set colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Test results directory
TEST_RESULTS_DIR="${PROJECT_ROOT}/test-results"
mkdir -p "$TEST_RESULTS_DIR"

# Log file
LOG_FILE="${TEST_RESULTS_DIR}/test_run_$(date +%Y%m%d_%H%M%S).log"
SUMMARY_FILE="${TEST_RESULTS_DIR}/test_summary_$(date +%Y%m%d_%H%M%S).md"

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

# Function to run tests for a specific component
run_component_tests() {
  local component="$1"
  local component_dir="${PROJECT_ROOT}/${component}"
  local test_command="$2"
  local test_result_file="${TEST_RESULTS_DIR}/${component}_test_results.xml"
  
  log_message "Running tests for ${component}..." "INFO"
  
  if [ ! -d "$component_dir" ]; then
    log_message "Component directory not found: $component_dir" "ERROR"
    return 1
  fi
  
  cd "$component_dir" || { log_message "Failed to change to directory: $component_dir" "ERROR"; return 1; }
  
  # Execute the test command
  log_message "Executing: $test_command" "DEBUG"
  eval "$test_command" > "${TEST_RESULTS_DIR}/${component}_test_output.log" 2>&1
  
  local exit_code=$?
  if [ $exit_code -eq 0 ]; then
    log_message "Tests for ${component} completed successfully" "SUCCESS"
    echo -e "${GREEN}✓ ${component} tests passed${NC}"
  else
    log_message "Tests for ${component} failed with exit code $exit_code" "ERROR"
    echo -e "${RED}✗ ${component} tests failed${NC}"
  fi
  
  return $exit_code
}

# Main function to run all tests
run_all_tests() {
  log_message "Starting unified test run for BlockGuardian" "INFO"
  echo -e "${BLUE}========== BlockGuardian Unified Testing ==========${NC}"
  
  # Initialize counters
  local passed=0
  local failed=0
  local skipped=0
  
  # Create test summary header
  echo "# BlockGuardian Test Summary" > "$SUMMARY_FILE"
  echo "Generated on: $(date)" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "## Test Results" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "| Component | Status | Details |" >> "$SUMMARY_FILE"
  echo "|-----------|--------|---------|" >> "$SUMMARY_FILE"
  
  # Backend tests
  if [ -d "${PROJECT_ROOT}/backend" ]; then
    # Check if Python virtual environment exists
    if [ -d "${PROJECT_ROOT}/backend/venv" ]; then
      echo -e "${BLUE}Running backend tests...${NC}"
      if run_component_tests "backend" "source venv/bin/activate && python -m pytest tests/ --junitxml=${TEST_RESULTS_DIR}/backend_test_results.xml"; then
        echo "| Backend | ✅ Passed | [View Logs](${TEST_RESULTS_DIR}/backend_test_output.log) |" >> "$SUMMARY_FILE"
        ((passed++))
      else
        echo "| Backend | ❌ Failed | [View Logs](${TEST_RESULTS_DIR}/backend_test_output.log) |" >> "$SUMMARY_FILE"
        ((failed++))
      fi
    else
      log_message "Backend virtual environment not found, skipping tests" "WARNING"
      echo "| Backend | ⚠️ Skipped | Virtual environment not found |" >> "$SUMMARY_FILE"
      ((skipped++))
    fi
  else
    log_message "Backend directory not found, skipping tests" "WARNING"
    echo "| Backend | ⚠️ Skipped | Directory not found |" >> "$SUMMARY_FILE"
    ((skipped++))
  fi
  
  # Blockchain contracts tests
  if [ -d "${PROJECT_ROOT}/blockchain-contracts" ]; then
    if command_exists npx; then
      echo -e "${BLUE}Running blockchain contracts tests...${NC}"
      if run_component_tests "blockchain-contracts" "npx hardhat test"; then
        echo "| Blockchain Contracts | ✅ Passed | [View Logs](${TEST_RESULTS_DIR}/blockchain-contracts_test_output.log) |" >> "$SUMMARY_FILE"
        ((passed++))
      else
        echo "| Blockchain Contracts | ❌ Failed | [View Logs](${TEST_RESULTS_DIR}/blockchain-contracts_test_output.log) |" >> "$SUMMARY_FILE"
        ((failed++))
      fi
    else
      log_message "npx not found, skipping blockchain contracts tests" "WARNING"
      echo "| Blockchain Contracts | ⚠️ Skipped | npx not found |" >> "$SUMMARY_FILE"
      ((skipped++))
    fi
  else
    log_message "Blockchain contracts directory not found, skipping tests" "WARNING"
    echo "| Blockchain Contracts | ⚠️ Skipped | Directory not found |" >> "$SUMMARY_FILE"
    ((skipped++))
  fi
  
  # Web frontend tests
  if [ -d "${PROJECT_ROOT}/web-frontend" ]; then
    if command_exists npm; then
      echo -e "${BLUE}Running web frontend tests...${NC}"
      if run_component_tests "web-frontend" "npm test -- --ci --reporters=default --reporters=jest-junit"; then
        echo "| Web Frontend | ✅ Passed | [View Logs](${TEST_RESULTS_DIR}/web-frontend_test_output.log) |" >> "$SUMMARY_FILE"
        ((passed++))
      else
        echo "| Web Frontend | ❌ Failed | [View Logs](${TEST_RESULTS_DIR}/web-frontend_test_output.log) |" >> "$SUMMARY_FILE"
        ((failed++))
      fi
    else
      log_message "npm not found, skipping web frontend tests" "WARNING"
      echo "| Web Frontend | ⚠️ Skipped | npm not found |" >> "$SUMMARY_FILE"
      ((skipped++))
    fi
  else
    log_message "Web frontend directory not found, skipping tests" "WARNING"
    echo "| Web Frontend | ⚠️ Skipped | Directory not found |" >> "$SUMMARY_FILE"
    ((skipped++))
  fi
  
  # Mobile frontend tests
  if [ -d "${PROJECT_ROOT}/mobile-frontend" ]; then
    if command_exists npm; then
      echo -e "${BLUE}Running mobile frontend tests...${NC}"
      if run_component_tests "mobile-frontend" "npm test -- --ci --reporters=default --reporters=jest-junit"; then
        echo "| Mobile Frontend | ✅ Passed | [View Logs](${TEST_RESULTS_DIR}/mobile-frontend_test_output.log) |" >> "$SUMMARY_FILE"
        ((passed++))
      else
        echo "| Mobile Frontend | ❌ Failed | [View Logs](${TEST_RESULTS_DIR}/mobile-frontend_test_output.log) |" >> "$SUMMARY_FILE"
        ((failed++))
      fi
    else
      log_message "npm not found, skipping mobile frontend tests" "WARNING"
      echo "| Mobile Frontend | ⚠️ Skipped | npm not found |" >> "$SUMMARY_FILE"
      ((skipped++))
    fi
  else
    log_message "Mobile frontend directory not found, skipping tests" "WARNING"
    echo "| Mobile Frontend | ⚠️ Skipped | Directory not found |" >> "$SUMMARY_FILE"
    ((skipped++))
  fi
  
  # Data analysis tests
  if [ -d "${PROJECT_ROOT}/data-analysis" ]; then
    if [ -d "${PROJECT_ROOT}/data-analysis/venv" ]; then
      echo -e "${BLUE}Running data analysis tests...${NC}"
      if run_component_tests "data-analysis" "source venv/bin/activate && python -m pytest tests/ --junitxml=${TEST_RESULTS_DIR}/data-analysis_test_results.xml"; then
        echo "| Data Analysis | ✅ Passed | [View Logs](${TEST_RESULTS_DIR}/data-analysis_test_output.log) |" >> "$SUMMARY_FILE"
        ((passed++))
      else
        echo "| Data Analysis | ❌ Failed | [View Logs](${TEST_RESULTS_DIR}/data-analysis_test_output.log) |" >> "$SUMMARY_FILE"
        ((failed++))
      fi
    else
      log_message "Data analysis virtual environment not found, skipping tests" "WARNING"
      echo "| Data Analysis | ⚠️ Skipped | Virtual environment not found |" >> "$SUMMARY_FILE"
      ((skipped++))
    fi
  else
    log_message "Data analysis directory not found, skipping tests" "WARNING"
    echo "| Data Analysis | ⚠️ Skipped | Directory not found |" >> "$SUMMARY_FILE"
    ((skipped++))
  fi
  
  # Add summary statistics
  echo "" >> "$SUMMARY_FILE"
  echo "## Summary Statistics" >> "$SUMMARY_FILE"
  echo "" >> "$SUMMARY_FILE"
  echo "- **Passed:** $passed" >> "$SUMMARY_FILE"
  echo "- **Failed:** $failed" >> "$SUMMARY_FILE"
  echo "- **Skipped:** $skipped" >> "$SUMMARY_FILE"
  echo "- **Total:** $((passed + failed + skipped))" >> "$SUMMARY_FILE"
  
  # Print summary to console
  echo -e "${BLUE}========== Test Summary ==========${NC}"
  echo -e "${GREEN}Passed: $passed${NC}"
  echo -e "${RED}Failed: $failed${NC}"
  echo -e "${YELLOW}Skipped: $skipped${NC}"
  echo -e "${BLUE}Total: $((passed + failed + skipped))${NC}"
  
  log_message "Test run completed. Results saved to $SUMMARY_FILE" "INFO"
  
  # Return non-zero exit code if any tests failed
  if [ $failed -gt 0 ]; then
    return 1
  else
    return 0
  fi
}

# Run all tests
run_all_tests
exit_code=$?

# Return the exit code
exit $exit_code
