#!/bin/bash

# Medical AI Demo - One-Command Setup Script
# This script sets up the entire demo environment

set -e  # Exit on error

echo "🏥 Medical AI Assistant Demo - Setup"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
echo -e "${GREEN}✓${NC} Python $PYTHON_VERSION found"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
NODE_VERSION=$(node --version)
echo -e "${GREEN}✓${NC} Node.js $NODE_VERSION found"

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️${NC} Docker not found. nilAI services will not be available."
    DOCKER_AVAILABLE=false
else
    echo -e "${GREEN}✓${NC} Docker found"
    DOCKER_AVAILABLE=true
fi

echo ""
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
else
    echo -e "${GREEN}✓${NC} Virtual environment exists"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt > /dev/null 2>&1
echo -e "${GREEN}✓${NC} Backend dependencies installed"

# Setup environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Backend .env created (please review settings)"
else
    echo -e "${GREEN}✓${NC} Backend .env exists"
fi

# Create logs directory
mkdir -p logs
echo -e "${GREEN}✓${NC} Logs directory created"

cd ..

echo ""
echo "🎨 Setting up frontend..."
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${GREEN}✓${NC} Frontend dependencies exist"
fi

# Setup environment file
if [ ! -f ".env.local" ]; then
    cp .env.local.example .env.local
    echo -e "${GREEN}✓${NC} Frontend .env.local created"
else
    echo -e "${GREEN}✓${NC} Frontend .env.local exists"
fi

cd ..

echo ""
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo "🚀 Setting up nilAI (optional - Docker required)..."
    
    if [ -d "../NIL/nilAI" ]; then
        echo "Found nilAI in NIL folder"
        echo "To start nilAI manually:"
        echo "  cd ../NIL/nilAI"
        echo "  docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d"
    else
        echo -e "${YELLOW}⚠️${NC} nilAI not found in ../NIL/nilAI"
        echo "Please ensure NIL folder is properly set up"
    fi
else
    echo "⚠️ Docker not available - nilAI services skipped"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📖 Next steps:"
echo ""
echo "1. Review environment files:"
echo "   - backend/.env"
echo "   - frontend/.env.local"
echo ""
echo "2. Start the demo:"
echo "   ./scripts/start-demo.sh"
echo ""
echo "3. Access the application:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:8000"
echo "   - API Docs: http://localhost:8000/docs"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide:  docs/SETUP.md"
echo "   - Demo Script:  docs/DEMO_SCRIPT.md"
echo "   - Architecture: docs/ARCHITECTURE.md"
echo ""
echo "🎉 Ready to demo! Run ./scripts/start-demo.sh"
