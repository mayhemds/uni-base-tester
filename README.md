# Universal Database Test

🔄 **Universal database connection testing for any project** - verify read/write/delete operations before app startup.

[![npm version](https://badge.fury.io/js/uni-database-tester.svg)](https://badge.fury.io/js/uni-database-tester)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **Universal**: Works with PostgreSQL, MySQL, MongoDB, Supabase, and custom databases
- **Framework Agnostic**: Use with React, Vue, Node.js, or any JavaScript project
- **CLI Tools**: Test databases from command line
- **React Components**: Drop-in UI components for connection status
- **TypeScript**: Full type safety
- **Configurable**: Extensive configuration options
- **Zero Dependencies**: Minimal external dependencies

## 🚀 Quick Start

### Installation

```bash
npm install uni-database-tester
# or
yarn add uni-database-tester
# or
pnpm add uni-database-tester
```

### Basic Usage

```typescript
import { testDatabase } from 'uni-database-tester';

const config = {
  database: {
    type: 'postgresql',
    connectionString: process.env.DATABASE_URL
  }
};

const result = await testDatabase(config);
console.log(result.overall ? '✅ Connected' : '❌ Failed');
```

## 📖 Usage Examples

### 1. PostgreSQL / Supabase

```typescript
import { UniversalDatabaseTest } from 'uni-database-tester';

const config = {
  database: {
    type: 'supabase',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },
  tableName: 'connection_test',
  autoCreateTable: true,
  cleanupAfterTest: true
};

const tester = new UniversalDatabaseTest(config);
const result = await tester.runTestSuite();
```

### 2. MySQL

```typescript
const config = {
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'myapp',
    username: 'user',
    password: 'password'
  }
};

const connected = await quickDatabaseTest(config);
```

### 3. MongoDB

```typescript
const config = {
  database: {
    type: 'mongodb',
    connectionString: 'mongodb://localhost:27017/myapp'
  }
};

const result = await testDatabase(config);
```

### 4. React Integration

```tsx
import { DatabaseTestProvider, DatabaseTestComponent } from 'uni-database-tester/react';

function App() {
  const config = {
    database: {
      type: 'postgresql',
      connectionString: process.env.DATABASE_URL
    }
  };

  return (
    <DatabaseTestProvider config={config}>
      <YourMainApp />
    </DatabaseTestProvider>
  );
}

// Or use the component directly
function DatabaseStatus() {
  return (
    <DatabaseTestComponent 
      config={config}
      showDetailedResults={true}
      onTestComplete={(result) => console.log(result)}
    />
  );
}
```

### 5. Custom Database Adapter

```typescript
import { DatabaseAdapter, TestResult } from 'uni-database-tester';

class MyCustomAdapter implements DatabaseAdapter {
  async connect(): Promise<void> {
    // Your connection logic
  }
  
  async testRead(): Promise<TestResult> {
    // Your read test logic
    return { success: true, operation: 'read' };
  }
  
  async testWrite(message: string): Promise<TestResult> {
    // Your write test logic
    return { success: true, operation: 'write', details: { id: '123' } };
  }
  
  async testDelete(id: string): Promise<TestResult> {
    // Your delete test logic
    return { success: true, operation: 'delete' };
  }
  
  async disconnect(): Promise<void> {
    // Your cleanup logic
  }
  
  async createTestTable(): Promise<void> {
    // Your table creation logic
  }
}

const config = {
  database: {
    type: 'custom',
    customAdapter: new MyCustomAdapter()
  }
};
```

## 🖥️ CLI Usage

### Installation (Global)

```bash
npm install -g uni-database-tester
```

### Initialize Configuration

```bash
db-test init
```

This creates a `db-test.config.json` file in your project.

### Run Tests

```bash
# Using config file
db-test test -c db-test.config.json

# Using environment variables
db-test test --database postgresql --verbose

# Using connection string
DATABASE_URL="postgresql://user:pass@localhost:5432/db" db-test test

# Watch mode (reruns tests periodically)
db-test test --watch

# JSON output
db-test test --json
```

### Generate Setup Files

```bash
# Generate migration files and config templates
db-test setup --database postgresql --output ./db-setup

# This creates:
# ./db-setup/migrations/001_create_db_test_table.sql
# ./db-setup/db-test.config.json
# ./db-setup/.env.example
```

## ⚙️ Configuration

### Complete Configuration Example

```typescript
const config: UniversalDbTestConfig = {
  database: {
    type: 'postgresql',
    connectionString: process.env.DATABASE_URL,
    // OR individual connection params
    host: 'localhost',
    port: 5432,
    database: 'myapp',
    username: 'user',
    password: 'password',
    ssl: true
  },
  
  // Test table settings
  tableName: 'db_connection_test',
  autoCreateTable: true,
  cleanupAfterTest: true,
  
  // Timing and retry settings
  timeoutMs: 30000,
  retryAttempts: 3,
  
  // Logging
  silent: false,
  
  // Hooks
  beforeTest: async () => {
    console.log('Preparing for tests...');
  },
  afterTest: async (result) => {
    console.log('Tests completed:', result.overall);
  }
};
```

### Environment Variables

The package automatically reads these environment variables:

```bash
# Generic Database
DATABASE_URL=postgresql://user:pass@host:port/db
DB_TYPE=postgresql
DB_HOST=localhost
DB_PORT=5432
DB_NAME=myapp
DB_USER=username
DB_PASSWORD=password
DB_SSL=true

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...

# Alternative Supabase names
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
```

## 🧩 Database Support

### Supported Databases

| Database | Status | Notes |
|----------|--------|-------|
| PostgreSQL | ✅ Full Support | Including connection pooling |
| Supabase | ✅ Full Support | RLS policies supported |
| MySQL | ✅ Full Support | MySQL 5.7+ and 8.0+ |
| MongoDB | ✅ Full Support | Collections as tables |
| SQLite | 🔄 Coming Soon | Planned for v1.1 |
| Custom | ✅ Full Support | Implement DatabaseAdapter interface |

### Required Permissions

Your database user needs these permissions:
- `CREATE TABLE` (if `autoCreateTable: true`)
- `SELECT` on test table
- `INSERT` on test table  
- `DELETE` on test table
- `DROP TABLE` (if `cleanupAfterTest: true`)

## 🔧 Advanced Usage

### App Startup Integration

```typescript
// server.ts or app.ts
import { testDatabase } from 'uni-database-tester';

async function startApp() {
  // Test database before starting server
  const dbResult = await testDatabase(config);
  
  if (!dbResult.overall) {
    console.error('❌ Database connection failed. Exiting.');
    process.exit(1);
  }
  
  console.log('✅ Database verified. Starting server...');
  // Start your server
}

startApp();
```

### Health Check Endpoint

```typescript
// Express.js example
import express from 'express';
import { quickDatabaseTest } from 'uni-database-tester';

const app = express();

app.get('/health', async (req, res) => {
  const dbHealthy = await quickDatabaseTest(config);
  
  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    database: dbHealthy ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});
```

### Next.js App Router Integration

```typescript
// app/providers.tsx
'use client'
import { DatabaseTestProvider } from 'uni-database-tester/react';

export function Providers({ children }: { children: React.ReactNode }) {
  const config = {
    database: {
      type: 'supabase',
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY!
    }
  };

  return (
    <DatabaseTestProvider 
      config={config}
      fallback={<div>Database connection failed</div>}
    >
      {children}
    </DatabaseTestProvider>
  );
}
```

### Docker Integration

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Test database connection as part of health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD npx db-test test --json || exit 1

CMD ["npm", "start"]
```

## 🔍 Troubleshooting

### Common Issues

#### 1. Permission Denied

```bash
❌ Error: permission denied for table db_connection_test
```

**Solution**: Grant proper permissions to your database user:

```sql
-- PostgreSQL
GRANT CREATE, SELECT, INSERT, DELETE ON DATABASE myapp TO myuser;

-- MySQL  
GRANT CREATE, SELECT, INSERT, DELETE ON myapp.* TO 'myuser'@'%';
```

#### 2. Table Already Exists

```bash
❌ Error: table "db_connection_test" already exists
```

**Solution**: Set `autoCreateTable: false` or use a different table name:

```typescript
const config = {
  database: { /* ... */ },
  tableName: 'my_custom_test_table', // Different name
  autoCreateTable: true
};
```

#### 3. Connection Timeout

```bash
❌ Error: Connection timeout after 30000ms
```

**Solution**: Increase timeout or check network connectivity:

```typescript
const config = {
  database: { /* ... */ },
  timeoutMs: 60000, // Increase to 60 seconds
  retryAttempts: 5   // More retries
};
```

#### 4. SSL/TLS Issues

```bash
❌ Error: SSL connection required
```

**Solution**: Enable SSL in your configuration:

```typescript
const config = {
  database: {
    type: 'postgresql',
    host: 'your-host',
    ssl: true, // Enable SSL
    // ... other options
  }
};
```

### Debug Mode

Enable verbose logging to see detailed information:

```bash
# CLI
db-test test --verbose

# Or in code
const config = {
  database: { /* ... */ },
  silent: false  // Enable logging
};
```

## 🧪 Testing

The package includes comprehensive tests:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Test specific database
npm run test -- --testNamePattern="PostgreSQL"
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit your changes (`git commit -m 'Add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Adding New Database Support

To add support for a new database, implement the `DatabaseAdapter` interface:

```typescript
// src/adapters/mydatabase.ts
import { DatabaseAdapter, DatabaseConfig, TestResult } from '../types';

export class MyDatabaseAdapter implements DatabaseAdapter {
  // Implement all required methods
  async connect(): Promise<void> { /* ... */ }
  async disconnect(): Promise<void> { /* ... */ }
  async testRead(): Promise<TestResult> { /* ... */ }
  async testWrite(message: string): Promise<TestResult> { /* ... */ }
  async testDelete(id: string): Promise<TestResult> { /* ... */ }
  async createTestTable(): Promise<void> { /* ... */ }
}
```

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by database health check patterns
- Built for the modern JavaScript ecosystem
- Designed for reliability and simplicity

---

**Made with ❤️ by mayhemds**

For support, please open an issue on [GitHub](https://github.com/mayhemds/universal-db-test).