#!/bin/bash

# Disaster Response Platform - Setup Script
echo "==========================================="
echo "  Disaster Response Coordination Platform  "
echo "           Developer Setup Script          "
echo "==========================================="

# Check requirements
echo "Checking pre-requisites..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed. Please download Node.js >= 18."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed."
    exit 1
fi

echo "Node version: $(node -v)"
echo "npm version:  $(npm -v)"

# 1. Environment variables config
echo "Configuring environment files..."
if [ ! -f "apps/backend/.env" ]; then
    if [ -f "apps/backend/.env.example" ]; then
        cp apps/backend/.env.example apps/backend/.env
        echo "Created apps/backend/.env file from .env.example template."
    elif [ -f "apps/backend/api/.env.example" ]; then
        cp apps/backend/api/.env.example apps/backend/.env
        echo "Created apps/backend/.env file from api/.env.example template."
    else
        echo "WARNING: Could not find .env.example files. Please create apps/backend/.env manually."
    fi
else
    echo "apps/backend/.env already exists. Skipping."
fi

# 2. Install backend API node dependencies
echo "Installing Backend REST API dependencies..."
cd apps/backend/api
npm install
cd ../../..

# 3. Install web frontend client node dependencies
echo "Installing Web App (RakshAlert) dependencies..."
cd apps/rakshalert
npm install
cd ../..

echo ""
echo "==========================================="
echo "  Setup Complete! Next Steps:              "
echo "==========================================="
echo "1. Ensure MongoDB service is running locally on your device."
echo "2. Open apps/backend/.env and customize variables (PORT, DB URLs, etc.)."
echo "3. Run seed command to populate mock database accounts (Admin, NGO, NDRF, Citizen):"
echo "   cd apps/backend/api && npm run seed"
echo "4. Spin up dev servers:"
echo "   - Backend API: cd apps/backend/api && npm run dev"
echo "   - Web Client: cd apps/rakshalert && npm run dev"
echo "==========================================="
