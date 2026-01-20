#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_DIR="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="${WORKSPACE_DIR}/backend"
FRONTEND_DIR="${WORKSPACE_DIR}/frontend"
TERRAFORM_DIR="${WORKSPACE_DIR}/terraform"
IAC_OUTPUTS_DIR="${WORKSPACE_DIR}/iac_outputs"
IAC_OUTPUTS_FILE="${IAC_OUTPUTS_DIR}/iac_outputs.json"

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${YELLOW}[→]${NC} $1"
}

check_tool() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is required but not installed."
        exit 1
    fi
}

echo ""
echo "=========================================="
echo "  French Language Tutor - Deployment"
echo "=========================================="
echo ""

# Check required tools
print_info "Checking required tools..."
check_tool terraform
check_tool aws
check_tool jq
check_tool npm
print_status "All required tools are available"

# Ensure iac_outputs directory exists
mkdir -p "${IAC_OUTPUTS_DIR}"

# Step 1: Build Lambda package
echo ""
print_info "Step 1: Building Lambda package..."
cd "${BACKEND_DIR}"
chmod +x build_lambda.sh
./build_lambda.sh
print_status "Lambda package built successfully"

# Step 2: Run Terraform apply
echo ""
print_info "Step 2: Applying Terraform infrastructure..."
cd "${TERRAFORM_DIR}"
terraform apply -auto-approve
terraform output -json > "${IAC_OUTPUTS_FILE}"
print_status "Terraform applied and outputs saved"

# Step 3: Build frontend with correct env vars
echo ""
print_info "Step 3: Building frontend..."

# Extract values from iac_outputs.json
COGNITO_USER_POOL_ID=$(jq -r '.cognito_user_pool_id.value' "${IAC_OUTPUTS_FILE}")
COGNITO_CLIENT_ID=$(jq -r '.cognito_client_id.value' "${IAC_OUTPUTS_FILE}")
API_URL=$(jq -r '.api_gateway_url.value' "${IAC_OUTPUTS_FILE}")

# Create .env file for frontend
cat > "${FRONTEND_DIR}/.env" << EOF
VITE_COGNITO_USER_POOL_ID=${COGNITO_USER_POOL_ID}
VITE_COGNITO_CLIENT_ID=${COGNITO_CLIENT_ID}
VITE_API_URL=${API_URL}
EOF

print_status "Frontend .env file created"

cd "${FRONTEND_DIR}"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_info "Installing npm dependencies..."
    npm install
    print_status "Dependencies installed"
fi

npm run build
print_status "Frontend built successfully"

# Step 4: Sync frontend to S3
echo ""
print_info "Step 4: Syncing frontend to S3..."
S3_BUCKET=$(jq -r '.s3_bucket_name.value' "${IAC_OUTPUTS_FILE}")
aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete
print_status "Frontend synced to S3"

# Step 5: Invalidate CloudFront cache
echo ""
print_info "Step 5: Invalidating CloudFront cache..."
CF_DIST_ID=$(jq -r '.cloudfront_distribution_id.value' "${IAC_OUTPUTS_FILE}")
aws cloudfront create-invalidation --distribution-id "${CF_DIST_ID}" --paths "/*" > /dev/null
print_status "CloudFront cache invalidation initiated"

# Step 6: Print summary
echo ""
echo "=========================================="
echo "  Deployment Complete!"
echo "=========================================="
echo ""
CLOUDFRONT_URL=$(jq -r '.cloudfront_url.value' "${IAC_OUTPUTS_FILE}")
print_status "Application URL: ${CLOUDFRONT_URL}"
print_status "API Gateway URL: ${API_URL}"
echo ""
