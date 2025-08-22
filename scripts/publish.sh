#!/bin/bash
# Publish script for universal-db-test

set -e

echo "📦 Publishing universal-db-test package..."

# Run tests
npm test

# Build package
npm run build

# Version check
echo "Current version: $(npm version --json | jq -r '.\"uni-database-tester\"')"
echo "Do you want to bump version? (patch/minor/major/skip)"
read -r version_bump

if [ "$version_bump" != "skip" ]; then
    npm version "$version_bump"
fi

# Publish to npm
echo "Publishing to npm..."
npm publish --access public

echo "✅ Package published successfully!"
