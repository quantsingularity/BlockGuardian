#!/bin/bash
# BlockGuardian Backend Startup Script

set -e

echo "========================================="
echo "BlockGuardian Backend Startup"
echo "========================================="
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.deps_installed" ]; then
    echo "Installing dependencies..."
    pip install --quiet --no-input --upgrade pip setuptools wheel
    pip install --quiet --no-input Flask Flask-CORS Flask-SQLAlchemy Flask-JWT-Extended redis bcrypt cryptography PyJWT pyotp qrcode bleach phonenumbers email-validator python-dotenv Pillow Flask-Limiter
    touch venv/.deps_installed
    echo "Dependencies installed successfully"
fi

# Create necessary directories
mkdir -p src/database
mkdir -p logs

# Set environment variables if .env exists
if [ -f ".env" ]; then
    echo "Loading environment variables from .env"
    export $(cat .env | xargs)
fi

# Default to development mode if not set
export FLASK_ENV=${FLASK_ENV:-development}

echo ""
echo "Starting BlockGuardian Backend..."
echo "Environment: $FLASK_ENV"
echo "Host: 0.0.0.0"
echo "Port: 5000"
echo ""

# Start the application
python src/main.py
