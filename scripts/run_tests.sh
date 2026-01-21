#!/bin/bash

# Integration Test Runner Script
# Runs both backend (pytest) and frontend (Playwright) integration tests

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track test results
BACKEND_RESULT=0
FRONTEND_RESULT=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Language Tutor Integration Tests${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Load environment variables from .env.test if it exists
if [ -f "$PROJECT_ROOT/.env.test" ]; then
    echo -e "${YELLOW}Loading environment from .env.test${NC}"
    export $(grep -v '^#' "$PROJECT_ROOT/.env.test" | xargs)
fi

# Display test configuration
echo -e "${YELLOW}Test Configuration:${NC}"
echo "  API URL: ${TEST_API_URL:-https://vgxcb7g6al.execute-api.us-east-1.amazonaws.com}"
echo "  App URL: ${TEST_APP_URL:-https://d3blyys2t3r0hm.cloudfront.net}"
if [ -n "$TEST_USER_EMAIL" ]; then
    echo "  Auth: Enabled (TEST_USER_EMAIL set)"
else
    echo "  Auth: Disabled (authenticated tests will be skipped)"
fi
echo ""

# Run Backend Tests (pytest)
echo -e "${BLUE}----------------------------------------${NC}"
echo -e "${BLUE}Running Backend Tests (pytest)${NC}"
echo -e "${BLUE}----------------------------------------${NC}"

cd "$PROJECT_ROOT/backend"

# Install dependencies if needed
if [ ! -d "venv" ] && [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    pip install -r requirements.txt -q
fi

# Run pytest
echo ""
if pytest tests/ -v --tb=short; then
    echo -e "${GREEN}✓ Backend tests passed${NC}"
    BACKEND_RESULT=0
else
    echo -e "${RED}✗ Backend tests failed${NC}"
    BACKEND_RESULT=1
fi

echo ""

# Run Frontend Tests (Playwright)
echo -e "${BLUE}----------------------------------------${NC}"
echo -e "${BLUE}Running Frontend Tests (Playwright)${NC}"
echo -e "${BLUE}----------------------------------------${NC}"

cd "$PROJECT_ROOT/frontend"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    npm install
fi

# Install Playwright browsers if needed
if ! npx playwright --version > /dev/null 2>&1; then
    echo -e "${YELLOW}Installing Playwright browsers...${NC}"
    npx playwright install --with-deps chromium
fi

# Run Playwright tests (chromium only for speed, can be changed to run all browsers)
echo ""
if npx playwright test --project=chromium --reporter=list; then
    echo -e "${GREEN}✓ Frontend tests passed${NC}"
    FRONTEND_RESULT=0
else
    echo -e "${RED}✗ Frontend tests failed${NC}"
    FRONTEND_RESULT=1
fi

echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Test Results Summary${NC}"
echo -e "${BLUE}========================================${NC}"

if [ $BACKEND_RESULT -eq 0 ]; then
    echo -e "  Backend:  ${GREEN}PASSED${NC}"
else
    echo -e "  Backend:  ${RED}FAILED${NC}"
fi

if [ $FRONTEND_RESULT -eq 0 ]; then
    echo -e "  Frontend: ${GREEN}PASSED${NC}"
else
    echo -e "  Frontend: ${RED}FAILED${NC}"
fi

echo ""

# Exit with appropriate code
if [ $BACKEND_RESULT -eq 0 ] && [ $FRONTEND_RESULT -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed.${NC}"
    exit 1
fi
