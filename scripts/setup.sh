#!/bin/bash
# scripts/setup.sh - Universal DB Test Package Setup

set -e

echo "🚀 Setting up Universal Database Test package..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    print_error "git is not installed. Please install git first."
    exit 1
fi

# Create project structure
print_info "Creating project structure..."

mkdir -p src/{adapters,react-components,types}
mkdir -p dist
mkdir -p migrations
mkdir -p tests
mkdir -p scripts
mkdir -p templates

print_status "Created directory structure"

# Create TypeScript configuration
print_info "Setting up TypeScript configuration..."

cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020", "DOM"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist",
    "tests"
  ]
}
EOF

print_status "Created tsconfig.json"

# Create Jest configuration
print_info "Setting up Jest configuration..."

cat > jest.config.js << 'EOF'
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**/*',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
EOF

print_status "Created jest.config.js"

# Create test setup file
mkdir -p tests
cat > tests/setup.ts << 'EOF'
// Test setup file
import { config } from 'dotenv';

// Load test environment variables
config({ path: '.env.test' });

// Global test timeout
jest.setTimeout(30000);
EOF

print_status "Created test setup"

# Create example test
cat > tests/index.test.ts << 'EOF'
import { UniversalDatabaseTest } from '../src/index';

describe('UniversalDatabaseTest', () => {
  it('should create instance with valid config', () => {
    const config = {
      database: {
        type: 'postgresql' as const,
        connectionString: 'postgresql://test:test@localhost:5432/test'
      }
    };
    
    const tester = new UniversalDatabaseTest(config);
    expect(tester).toBeInstanceOf(UniversalDatabaseTest);
  });
  
  it('should throw error with invalid database type', () => {
    expect(() => {
      new UniversalDatabaseTest({
        database: {
          type: 'invalid' as any
        }
      });
    }).toThrow('Unsupported database type');
  });
});
EOF

print_status "Created example tests"

# Create .env.example file
cat > .env.example << 'EOF'
# Database Configuration Examples

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/database
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=username
DB_PASSWORD=password
DB_SSL=false

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsI...

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=myapp
MYSQL_USER=username
MYSQL_PASSWORD=password

# MongoDB
MONGODB_URL=mongodb://localhost:27017/myapp
EOF

print_status "Created .env.example"

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# Coverage reports
coverage/
.nyc_output/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Temporary files
tmp/
temp/
EOF

print_status "Created .gitignore"

# Create build script
cat > scripts/build.sh << 'EOF'
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
EOF

chmod +x scripts/build.sh
print_status "Created build script"

# Create publish script
cat > scripts/publish.sh << 'EOF'
#!/bin/bash
# Publish script for universal-db-test

set -e

echo "📦 Publishing universal-db-test package..."

# Run tests
npm test

# Build package
npm run build

# Version check
echo "Current version: $(npm version --json | jq -r '.\"universal-db-test\"')"
echo "Do you want to bump version? (patch/minor/major/skip)"
read -r version_bump

if [ "$version_bump" != "skip" ]; then
    npm version "$version_bump"
fi

# Publish to npm
echo "Publishing to npm..."
npm publish --access public

echo "✅ Package published successfully!"
EOF

chmod +x scripts/publish.sh
print_status "Created publish script"

# Create development script
cat > scripts/dev.sh << 'EOF'
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
EOF

chmod +x scripts/dev.sh
print_status "Created development script"

# Update package.json scripts
print_info "Updating package.json scripts..."

# Create a temporary package.json with updated scripts
npm pkg set scripts.build="./scripts/build.sh"
npm pkg set scripts.dev="./scripts/dev.sh"
npm pkg set scripts.publish="./scripts/publish.sh"
npm pkg set scripts.test="jest"
npm pkg set scripts.test:watch="jest --watch"
npm pkg set scripts.test:coverage="jest --coverage"
npm pkg set scripts.lint="eslint src/**/*.ts"
npm pkg set scripts.lint:fix="eslint src/**/*.ts --fix"
npm pkg set scripts.typecheck="tsc --noEmit"

print_status "Updated package.json scripts"

# Install dependencies
print_info "Installing dependencies..."

npm install --save-dev typescript @types/node jest @types/jest ts-jest eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin

print_status "Installed development dependencies"

# Create ESLint configuration
cat > .eslintrc.js << 'EOF'
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    '@typescript-eslint/recommended',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
  },
};
EOF

print_status "Created ESLint configuration"

# Create initial adapter index file
cat > src/adapters/index.ts << 'EOF'
// Export all adapters
export { PostgreSQLAdapter } from './postgresql';
export { MySQLAdapter } from './mysql';
export { MongoDBAdapter } from './mongodb';
export { SupabaseAdapter } from './supabase';
EOF

print_status "Created adapter index file"

# Create React components index
cat > src/react-components/index.ts << 'EOF'
// Export all React components
export { DatabaseTestComponent, DatabaseTestProvider } from './DatabaseTestComponent';
export type { ReactComponentProps } from '../types';
EOF

print_status "Created React components index"

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    print_info "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: Universal Database Test package setup"
    print_status "Initialized git repository"
else
    print_warning "Git repository already exists"
fi

# Create initial README for development
cat > DEVELOPMENT.md << 'EOF'
# Development Guide

## Setup

1. Clone the repository
2. Run `./scripts/setup.sh` (this script)
3. Copy `.env.example` to `.env` and configure

## Development Commands

```bash
# Start development mode (TypeScript watch)
npm run dev

# Run tests
npm test
npm run test:watch
npm run test:coverage

# Lint code
npm run lint
npm run lint:fix

# Type check
npm run typecheck

# Build package
npm run build

# Publish package
npm run publish
```

## Adding New Database Adapters

1. Create new adapter in `src/adapters/`
2. Implement the `DatabaseAdapter` interface
3. Add tests in `tests/`
4. Export from `src/adapters/index.ts`
5. Update main switch statement in `src/index.ts`

## Testing with Different Databases

Use environment variables to test with real databases:

```bash
# PostgreSQL
DATABASE_URL=postgresql://... npm test

# Supabase  
NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm test

# MySQL
MYSQL_HOST=... MYSQL_USER=... npm test
```
EOF

print_status "Created development guide"

# Final instructions
echo ""
print_info "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and configure your database"
echo "2. Run 'npm run dev' to start development mode"
echo "3. Run 'npm test' to run the test suite"
echo "4. Edit src/ files to implement your package"
echo "5. Run 'npm run build' to build the package"
echo "6. Run 'npm run publish' when ready to publish"
echo ""
print_warning "Don't forget to:"
echo "- Update package.json with your name and repository URL"
echo "- Create an npm account if you don't have one"
echo "- Update README.md with your specific information"
echo "- Add your database adapter implementations"
echo ""
print_status "Happy coding! 🚀"