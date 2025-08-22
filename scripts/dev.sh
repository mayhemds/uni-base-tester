#!/bin/bash
# Development script for universal-db-test

set -e

echo "🔧 Starting development mode..."

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Run TypeScript in watch mode
echo "Starting TypeScript compiler in watch mode..."
npx tsc --watch &

# Store the PID
TSC_PID=$!

# Cleanup function
cleanup() {
    echo "Stopping TypeScript compiler..."
    kill $TSC_PID 2>/dev/null || true
    exit 0
}

# Set trap for cleanup
trap cleanup SIGINT SIGTERM

echo "✅ Development mode started. Press Ctrl+C to stop."
wait $TSC_PID
