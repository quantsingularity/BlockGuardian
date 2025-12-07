#!/bin/bash

# BlockGuardian Run Script
# This script starts the backend, blockchain, and frontend components.
# It is designed to be run from the root of the BlockGuardian project directory.

# --- Configuration and Setup ---
set -euo pipefail # Exit on error, unset variable, and pipe failure
ROOT_DIR=$(pwd)

# Colors for terminal output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Starting BlockGuardian application...${NC}"

# Function to check if a process is running and kill it
cleanup() {
  echo -e "\n${BLUE}Stopping services...${NC}"
  # Check if PIDs are set and kill them
  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  if [ -n "${BLOCKCHAIN_PID:-}" ]; then
    kill "$BLOCKCHAIN_PID" 2>/dev/null || true
  fi
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  echo -e "${GREEN}All services stopped${NC}"
  exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGINT SIGTERM

# --- Virtual Environment Setup ---
VENV_DIR="$ROOT_DIR/venv"
if [ ! -d "$VENV_DIR" ]; then
  echo -e "${BLUE}Creating Python virtual environment...${NC}"
  python3 -m venv "$VENV_DIR"
fi

# Activate virtual environment for dependency installation
source "$VENV_DIR/bin/activate"

# --- Start Backend Server ---
echo -e "${BLUE}Starting backend server...${NC}"
BACKEND_DIR="$ROOT_DIR/code/backend"
if [ -d "$BACKEND_DIR" ]; then
  (
    cd "$BACKEND_DIR"
    pip install -r requirements.txt > /dev/null
    # Use uvicorn or gunicorn for production, but app.py for development
    python app.py &
    BACKEND_PID=$!
    echo -e "${GREEN}Backend started with PID: ${BACKEND_PID}${NC}"
  )
else
  echo -e "${RED}Warning: Backend directory not found at $BACKEND_DIR. Skipping backend start.${NC}"
fi

# --- Start Blockchain Node ---
echo -e "${BLUE}Starting blockchain node...${NC}"
BLOCKCHAIN_DIR="$ROOT_DIR/blockchain"
if [ -d "$BLOCKCHAIN_DIR" ]; then
  (
    cd "$BLOCKCHAIN_DIR"
    npm install > /dev/null
    npm run node &
    BLOCKCHAIN_PID=$!
    echo -e "${GREEN}Blockchain node started with PID: ${BLOCKCHAIN_PID}${NC}"
  )
else
  echo -e "${RED}Warning: Blockchain directory not found at $BLOCKCHAIN_DIR. Skipping blockchain start.${NC}"
fi

# --- Wait for services to initialize ---
echo -e "${BLUE}Waiting for services to initialize (8 seconds)...${NC}"
sleep 8

# --- Start Web Frontend ---
echo -e "${BLUE}Starting web frontend...${NC}"
FRONTEND_DIR="$ROOT_DIR/web-frontend"
if [ -d "$FRONTEND_DIR" ]; then
  (
    cd "$FRONTEND_DIR"
    npm install > /dev/null
    npm run dev & # Assuming 'dev' is the standard development start script for Next.js
    FRONTEND_PID=$!
    echo -e "${GREEN}Web Frontend started with PID: ${FRONTEND_PID}${NC}"
  )
else
  echo -e "${RED}Warning: Web Frontend directory not found at $FRONTEND_DIR. Skipping frontend start.${NC}"
fi

# Deactivate virtual environment
deactivate

# --- Final Status ---
echo -e "${GREEN}BlockGuardian application is attempting to run!${NC}"
echo -e "${GREEN}Access the application at: http://localhost:3000 (or check component logs for correct port)${NC}"
echo -e "${BLUE}Press Ctrl+C to stop all services${NC}"

# Keep script running until interrupted
wait
