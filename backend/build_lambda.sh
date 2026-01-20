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

# Install dependencies to build directory with Lambda-compatible platform
pip install --target "${BUILD_DIR}" -r "${SCRIPT_DIR}/requirements.txt" \
    --platform manylinux2014_x86_64 \
    --implementation cp \
    --python-version 3.11 \
    --only-binary=:all: \
    --quiet

# Copy application code
cp -r "${SCRIPT_DIR}/app" "${BUILD_DIR}/"

# Create zip package using Python (fallback for missing zip command)
cd "${BUILD_DIR}"
python3 -c "
import zipfile
import os

output_file = '${OUTPUT_FILE}'
with zipfile.ZipFile(output_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        for file in files:
            file_path = os.path.join(root, file)
            arcname = file_path[2:] if file_path.startswith('./') else file_path
            zipf.write(file_path, arcname)
"

echo "Lambda package created: ${OUTPUT_FILE}"
echo "Package size: $(du -h "${OUTPUT_FILE}" | cut -f1)"

# Clean up build directory
rm -rf "${BUILD_DIR}"
