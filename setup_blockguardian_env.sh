#!/bin/bash

# BlockGuardian Environment Setup Script
# This script automates the setup of the development environment for the BlockGuardian project.
# It assumes it is being run from the root of the BlockGuardian project directory.

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
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js is already installed. Verifying version..."
    node -v
fi

if ! command_exists npm; then
    echo "npm not found, attempting to install..."
    sudo apt-get install -y npm
else
    echo "npm is already installed. Verifying version..."
    npm -v
fi

# Install Yarn
if ! command_exists yarn; then
    echo "Installing Yarn..."
    sudo npm install --global yarn
else
    echo "Yarn is already installed."
fi

# Install Expo CLI
if ! command_exists expo; then
    echo "Installing Expo CLI..."
    sudo npm install --global expo-cli
else
    echo "Expo CLI is already installed."
fi

# Install Truffle CLI (globally, for code/blockchain)
if ! command_exists truffle; then
    echo "Installing Truffle CLI..."
    sudo npm install --global truffle
else
    echo "Truffle CLI is already installed."
fi

echo "System-level dependencies installation check complete."

# -----------------------------------------------------------------------------
# Project Component Setup
# Paths are relative to the script's location (BlockGuardian project root)
# -----------------------------------------------------------------------------

# Backend Setup (Python/FastAPI)
BACKEND_DIR="./code/backend"
if [ -d "$BACKEND_DIR" ]; then
    echo "Setting up Backend (Python/FastAPI) in $BACKEND_DIR ..."
    cd "$BACKEND_DIR"
    if [ ! -d "venv" ]; then
        echo "Creating Python virtual environment for backend..."
        python3 -m venv venv
    fi
    echo "Activating virtual environment and installing backend dependencies..."
    source venv/bin/activate
    pip install -r requirements.txt
    deactivate
    echo "Backend setup complete."
    cd - > /dev/null
else
    echo "Warning: Backend directory '$BACKEND_DIR' not found. Skipping backend setup."
fi

# Blockchain Setup (Node.js/Hardhat)
BLOCKCHAIN_DIR="./blockchain"
if [ -d "$BLOCKCHAIN_DIR" ]; then
    echo "Setting up Blockchain (Node.js/Hardhat) in $BLOCKCHAIN_DIR ..."
    cd "$BLOCKCHAIN_DIR"
    echo "Installing blockchain dependencies..."
    npm install
    echo "Blockchain setup complete."
    cd - > /dev/null
else
    echo "Warning: Blockchain directory '$BLOCKCHAIN_DIR' not found. Skipping blockchain setup."
fi

# Code/Blockchain Info (Truffle)
CODE_BLOCKCHAIN_DIR="./code/blockchain"
if [ -d "$CODE_BLOCKCHAIN_DIR" ]; then
    echo "Info: Code/Blockchain (Truffle) component found in $CODE_BLOCKCHAIN_DIR."
    echo "Truffle CLI has been installed globally. Use 'truffle compile', 'truffle migrate', etc., within this directory."
else
    echo "Warning: Code/Blockchain directory '$CODE_BLOCKCHAIN_DIR' not found."
fi

# Code/Frontend Setup (React/Webpack)
CODE_FRONTEND_DIR="./code/frontend"
if [ -d "$CODE_FRONTEND_DIR" ]; then
    echo "Setting up Code/Frontend (React/Webpack) in $CODE_FRONTEND_DIR ..."
    cd "$CODE_FRONTEND_DIR"
    echo "Installing code/frontend dependencies..."
    npm install
    echo "Code/Frontend setup complete."
    cd - > /dev/null
else
    echo "Warning: Code/Frontend directory '$CODE_FRONTEND_DIR' not found. Skipping code/frontend setup."
fi

# Mobile Frontend Setup (Expo/React Native)
MOBILE_FRONTEND_DIR="./mobile-frontend"
if [ -d "$MOBILE_FRONTEND_DIR" ]; then
    echo "Setting up Mobile Frontend (Expo/React Native) in $MOBILE_FRONTEND_DIR ..."
    cd "$MOBILE_FRONTEND_DIR"
    echo "Installing mobile-frontend dependencies using Yarn..."
    yarn install
    echo "Mobile Frontend setup complete."
    cd - > /dev/null
else
    echo "Warning: Mobile Frontend directory '$MOBILE_FRONTEND_DIR' not found. Skipping mobile-frontend setup."
fi

# Web Frontend Setup (Next.js)
WEB_FRONTEND_DIR="./web-frontend"
if [ -d "$WEB_FRONTEND_DIR" ]; then
    echo "Setting up Web Frontend (Next.js) in $WEB_FRONTEND_DIR ..."
    cd "$WEB_FRONTEND_DIR"
    echo "Installing web-frontend dependencies..."
    npm install
    echo "Web Frontend setup complete."
    cd - > /dev/null
else
    echo "Warning: Web Frontend directory '$WEB_FRONTEND_DIR' not found. Skipping web-frontend setup."
fi

# -----------------------------------------------------------------------------
# Infrastructure Tools (Informational)
# -----------------------------------------------------------------------------
echo ""
echo "-----------------------------------------------------------------------------"
echo "Infrastructure Tools (Ansible, Kubernetes, Terraform):"
echo "The project includes configurations for Ansible, Kubernetes, and Terraform"
echo "in the './infrastructure' directory. Their setup is beyond the scope of this"
echo "basic development environment script. Please refer to their respective"
echo "documentation and the project's infrastructure guides for setup if needed."
echo "You might need to install tools like 'ansible', 'kubectl', 'helm', 'terraform' separately."
echo "-----------------------------------------------------------------------------"

# -----------------------------------------------------------------------------
# Final Instructions
# -----------------------------------------------------------------------------
echo ""
echo "BlockGuardian Development Environment Setup Script Finished!"
echo "---------------------------------------------------------"
echo "Summary of components and their setup locations:"
echo "  - Backend (Python/FastAPI): ./code/backend/ (venv created inside)"
echo "  - Blockchain (Node.js/Hardhat): ./blockchain/"
echo "  - Code/Blockchain (Truffle): ./code/blockchain/ (uses global Truffle CLI)"
echo "  - Code/Frontend (React/Webpack): ./code/frontend/"
echo "  - Mobile Frontend (Expo/React Native): ./mobile-frontend/ (uses global Expo CLI)"
echo "  - Web Frontend (Next.js): ./web-frontend/"

echo ""
echo "To run the project, you will likely need to start each component separately in its own terminal."
echo "Refer to the project's README.md, individual component READMEs (if any), and the package.json/script files within each component for specific run commands."
echo "The existing 'run_blockguardian.sh' script might offer a simplified way to run some parts, but ensure its paths align with your setup or adapt it as needed."
echo ""
echo "Remember to check for any specific Node.js or Python version requirements if you encounter issues during runtime."

chmod +x ./setup_blockguardian_env.sh
echo "Made the script executable: ./setup_blockguardian_env.sh"

echo "Setup script created at ./setup_blockguardian_env.sh"
