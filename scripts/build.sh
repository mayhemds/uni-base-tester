#!/bin/bash
# Build script for universal-db-test

set -e

echo "🔨 Building universal-db-test package..."

# Clean previous build
rm -rf dist/

# Build TypeScript
npx tsc

# Make CLI executable
chmod +x dist/cli.js

# Copy additional files
cp README.md dist/
cp package.json dist/
cp -r migrations/ dist/ 2>/dev/null || true

echo "✅ Build completed successfully!"
