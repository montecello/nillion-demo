#!/bin/bash
# Quick local test script - verifies everything works before deployment

set -e

echo "🧪 Medical AI Demo - Local Testing"
echo "=================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test counter
PASSED=0
FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
        ((PASSED++))
    else
        echo -e "${RED}✗${NC} $2"
        ((FAILED++))
    fi
}

echo "📋 Pre-flight checks..."
echo ""

# Check Python
python3 --version > /dev/null 2>&1
test_result $? "Python 3 installed"

# Check Node
node --version > /dev/null 2>&1
test_result $? "Node.js installed"

# Check backend dependencies
if [ -f "backend/venv/bin/python" ]; then
    test_result 0 "Backend virtual environment exists"
else
    test_result 1 "Backend virtual environment exists (run ./scripts/setup.sh)"
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    test_result 0 "Frontend dependencies installed"
else
    test_result 1 "Frontend dependencies installed (run ./scripts/setup.sh)"
fi

echo ""
echo "🔧 Checking backend..."
echo ""

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    test_result 0 "Backend is running on port 8000"
    
    # Test API endpoints
    curl -s http://localhost:8000/ > /dev/null 2>&1
    test_result $? "Root endpoint responds"
    
    curl -s http://localhost:8000/api/medical/status > /dev/null 2>&1
    test_result $? "Medical status endpoint responds"
    
    curl -s http://localhost:8000/api/attestation/proof > /dev/null 2>&1
    test_result $? "Attestation endpoint responds"
    
    curl -s http://localhost:8000/api/audit/summary > /dev/null 2>&1
    test_result $? "Audit summary endpoint responds"
else
    test_result 1 "Backend is running (start with: cd backend && source venv/bin/activate && uvicorn app.main:app --reload)"
fi

echo ""
echo "🎨 Checking frontend..."
echo ""

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    test_result 0 "Frontend is running on port 3000"
else
    test_result 1 "Frontend is running (start with: cd frontend && npm run dev)"
fi

echo ""
echo "📊 Test Results"
echo "==============="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Ready to test in browser.${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open http://localhost:3000 in your browser"
    echo "2. Follow the testing checklist in docs/LOCAL_TESTING.md"
    echo "3. Test all three tabs: Chat, Attestation, Audit Log"
    echo ""
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please fix issues before proceeding.${NC}"
    echo ""
    echo "If services aren't running:"
    echo "  ./scripts/start-demo.sh"
    echo ""
    echo "If dependencies missing:"
    echo "  ./scripts/setup.sh"
    echo ""
fi
