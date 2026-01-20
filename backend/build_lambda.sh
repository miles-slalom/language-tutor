#!/bin/bash
# Script to build Lambda deployment package as a zip file

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${SCRIPT_DIR}/build"
OUTPUT_FILE="${SCRIPT_DIR}/lambda_package.zip"

echo "Building Lambda deployment package..."

# Clean previous build
rm -rf "${BUILD_DIR}"
rm -f "${OUTPUT_FILE}"

# Create build directory
mkdir -p "${BUILD_DIR}"

# Install dependencies to build directory
pip install --target "${BUILD_DIR}" -r "${SCRIPT_DIR}/requirements.txt" --quiet

# Copy application code
cp -r "${SCRIPT_DIR}/app" "${BUILD_DIR}/"

# Create zip package
cd "${BUILD_DIR}"
zip -r "${OUTPUT_FILE}" . -q

echo "Lambda package created: ${OUTPUT_FILE}"
echo "Package size: $(du -h "${OUTPUT_FILE}" | cut -f1)"

# Clean up build directory
rm -rf "${BUILD_DIR}"
