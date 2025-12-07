#!/bin/bash

# BlockGuardian Environment Setup Script
# This script automates the setup of the development environment for the BlockGuardian project.
# It is designed to be run from the root of the BlockGuardian project directory.

# --- Configuration and Setup ---
set -euo pipefail # Exit on error, unset variable, and pipe failure
ROOT_DIR=$(pwd)

echo "Starting BlockGuardian Environment Setup..."

# -----------------------------------------------------------------------------
# Helper function to check if a command exists
# -----------------------------------------------------------------------------
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# -----------------------------------------------------------------------------
# Install System-Level Dependencies
# -----------------------------------------------------------------------------
echo "Updating package lists..."
sudo apt-get update -y

echo "Installing system-level dependencies..."

# Install Python 3 and venv
if ! command_exists python3; then
    echo "Installing Python 3..."
    sudo apt-get install -y python3
else
    echo "Python 3 is already installed."
fi

if ! command_exists pip3; then
    echo "Installing pip3..."
    sudo apt-get install -y python3-pip
else
    echo "pip3 is already installed."
fi

if ! dpkg -s python3-venv >/dev/null 2>&1; then
    echo "Installing python3-venv..."
    sudo apt-get install -y python3-venv
else
    echo "python3-venv is already installed."
fi

# Install Node.js and npm (e.g., Node.js 20.x)
if ! command_exists node; then
    echo "Installing Node.js and npm..."
    # Using the official NodeSource setup script for a specific version (20.x)
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed. Version: $(node -v)"
fi

# Install global npm packages (Note: Global installs are generally discouraged, but kept for project compatibility)
echo "Installing global npm packages: yarn, expo-cli, truffle..."
npm_packages=("yarn" "expo-cli" "truffle")
for pkg in "${npm_packages[@]}"; do
    if ! command_exists "$pkg"; then
        echo "Installing $pkg..."
        sudo npm install --global "$pkg"
    else
        echo "$pkg is already installed."
    fi
done

echo "System-level dependencies installation check complete."

# -----------------------------------------------------------------------------
# Project Component Setup
# Paths are relative to the script's location (BlockGuardian project root)
# Using subshells () to safely manage directory changes
# -----------------------------------------------------------------------------

# Backend Setup (Python/FastAPI)
BACKEND_DIR="$ROOT_DIR/code/backend"
if [ -d "$BACKEND_DIR" ]; then
    echo "Setting up Backend (Python/FastAPI) in $BACKEND_DIR ..."
    (
        cd "$BACKEND_DIR"
        VENV_PATH="./venv"
        if [ ! -d "$VENV_PATH" ]; then
            echo "Creating Python virtual environment for backend..."
            python3 -m venv "$VENV_PATH"
        fi
        echo "Activating virtual environment and installing backend dependencies..."
        source "$VENV_PATH/bin/activate"
        pip install -r requirements.txt
        deactivate
        echo "Backend setup complete."
    )
else
    echo "Warning: Backend directory '$BACKEND_DIR' not found. Skipping backend setup."
fi

# Blockchain Setup (Node.js/Hardhat)
BLOCKCHAIN_DIR="$ROOT_DIR/blockchain"
if [ -d "$BLOCKCHAIN_DIR" ]; then
    echo "Setting up Blockchain (Node.js/Hardhat) in $BLOCKCHAIN_DIR ..."
    (
        cd "$BLOCKCHAIN_DIR"
        echo "Installing blockchain dependencies..."
        npm install
        echo "Blockchain setup complete."
    )
else
    echo "Warning: Blockchain directory '$BLOCKCHAIN_DIR' not found. Skipping blockchain setup."
fi

# Code/Blockchain Info (Truffle) - Informational only, relies on global truffle
CODE_BLOCKCHAIN_DIR="$ROOT_DIR/code/blockchain"
if [ -d "$CODE_BLOCKCHAIN_DIR" ]; then
    echo "Info: Code/Blockchain (Truffle) component found in $CODE_BLOCKCHAIN_DIR."
    echo "Truffle CLI has been installed globally. Use 'truffle compile', 'truffle migrate', etc., within this directory."
fi

# Code/Frontend Setup (React/Webpack)
CODE_FRONTEND_DIR="$ROOT_DIR/code/frontend"
if [ -d "$CODE_FRONTEND_DIR" ]; then
    echo "Setting up Code/Frontend (React/Webpack) in $CODE_FRONTEND_DIR ..."
    (
        cd "$CODE_FRONTEND_DIR"
        echo "Installing code/frontend dependencies..."
        npm install
        echo "Code/Frontend setup complete."
    )
else
    echo "Warning: Code/Frontend directory '$CODE_FRONTEND_DIR' not found. Skipping code/frontend setup."
fi

# Mobile Frontend Setup (Expo/React Native)
MOBILE_FRONTEND_DIR="$ROOT_DIR/mobile-frontend"
if [ -d "$MOBILE_FRONTEND_DIR" ]; then
    echo "Setting up Mobile Frontend (Expo/React Native) in $MOBILE_FRONTEND_DIR ..."
    (
        cd "$MOBILE_FRONTEND_DIR"
        echo "Installing mobile-frontend dependencies using Yarn..."
        yarn install
        echo "Mobile Frontend setup complete."
    )
else
    echo "Warning: Mobile Frontend directory '$MOBILE_FRONTEND_DIR' not found. Skipping mobile-frontend setup."
fi

# Web Frontend Setup (Next.js)
WEB_FRONTEND_DIR="$ROOT_DIR/web-frontend"
if [ -d "$WEB_FRONTEND_DIR" ]; then
    echo "Setting up Web Frontend (Next.js) in $WEB_FRONTEND_DIR ..."
    (
        cd "$WEB_FRONTEND_DIR"
        echo "Installing web-frontend dependencies..."
        npm install
        echo "Web Frontend setup complete."
    )
else
    echo "Warning: Web Frontend directory '$WEB_FRONTEND_DIR' not found. Skipping web-frontend setup."
fi

# -----------------------------------------------------------------------------
# Final Instructions
# -----------------------------------------------------------------------------
echo ""
echo "BlockGuardian Development Environment Setup Script Finished!"
echo "---------------------------------------------------------"
echo "Summary of components and their setup locations:"
echo "  - Backend (Python/FastAPI): ./code/backend/ (venv created inside)"
echo "  - Blockchain (Node.js/Hardhat): ./blockchain/"
echo "  - Code/Blockchain (Truffle): ./code/blockchain/"
echo "  - Code/Frontend (React/Webpack): ./code/frontend/"
echo "  - Mobile Frontend (Expo/React Native): ./mobile-frontend/"
echo "  - Web Frontend (Next.js): ./web-frontend/"
echo ""
echo "To run the project, use the 'run_blockguardian.sh' script or start each component separately."
echo "Remember to check for any specific Node.js or Python version requirements if you encounter issues during runtime."
