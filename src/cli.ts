#!/usr/bin/env node
// src/cli.ts
import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { config as loadEnv } from 'dotenv';
import { UniversalDatabaseTest } from './index';
import { UniversalDbTestConfig, DatabaseConfig, CliOptions } from './types';

const program = new Command();

program
  .name('db-test')
  .description('Universal database connection testing tool')
  .version('1.0.0');

program
  .command('test')
  .description('Run database connection tests')
  .option('-c, --config <path>', 'Path to config file')
  .option('-d, --database <type>', 'Database type (postgresql, mysql, mongodb, supabase)')
  .option('-h, --host <host>', 'Database host')
  .option('-p, --port <port>', 'Database port', parseInt)
  .option('-u, --username <username>', 'Database username')
  .option('-w, --password <password>', 'Database password')
  .option('--ssl', 'Use SSL connection')
  .option('-t, --table <name>', 'Test table name', 'db_connection_test')
  .option('-v, --verbose', 'Verbose output')
  .option('-j, --json', 'Output results as JSON')
  .option('--watch', 'Watch mode - rerun tests on file changes')
  .action(async (options: CliOptions) => {
    try {
      loadEnv(); // Load .env file
      
      const config = await buildConfig(options);
      
      if (options.watch) {
        await runWatchMode(config, options);
      } else {
        await runSingleTest(config, options);
      }
    } catch (error) {
      console.error(chalk.red('❌ Error:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('setup')
  .description('Generate configuration files and database migrations')
  .option('-d, --database <type>', 'Database type (postgresql, mysql, mongodb, supabase)')
  .option('-o, --output <path>', 'Output directory', '.')
  .action(async (options) => {
    try {
      await generateSetupFiles(options.database, options.output);
      console.log(chalk.green('✅ Setup files generated successfully!'));
    } catch (error) {
      console.error(chalk.red('❌ Setup failed:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a new db-test configuration')
  .action(async () => {
    try {
      await initializeConfig();
      console.log(chalk.green('✅ Configuration initialized!'));
    } catch (error) {
      console.error(chalk.red('❌ Initialization failed:'), error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

async function buildConfig(options: CliOptions): Promise<UniversalDbTestConfig> {
  let config: UniversalDbTestConfig;

  // Load from config file if specified
  if (options.config) {
    const configPath = path.resolve(options.config);
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }
    
    const configContent = fs.readFileSync(configPath, 'utf8');
    config = JSON.parse(configContent);
  } else {
    // Build config from CLI options and environment variables
    const databaseConfig: DatabaseConfig = {
      type: (options.database as any) || process.env.DB_TYPE || 'postgresql',
      connectionString: process.env.DATABASE_URL,
      host: options.host || process.env.DB_HOST,
      port: options.port || parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      username: options.username || process.env.DB_USER,
      password: options.password || process.env.DB_PASSWORD,
      ssl: options.ssl || process.env.DB_SSL === 'true',
      // Supabase specific
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
      supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    };

    config = {
      database: databaseConfig,
      tableName: options.table,
      silent: !options.verbose
    };
  }

  return config;
}

async function runSingleTest(config: UniversalDbTestConfig, options: CliOptions) {
  if (options.verbose) {
    console.log(chalk.blue('🔧 Configuration:'));
    console.log(chalk.gray(JSON.stringify(config, null, 2)));
    console.log();
  }

  const tester = new UniversalDatabaseTest(config);
  const result = await tester.runTestSuite();

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    printTestResults(result, options.verbose);
  }

  process.exit(result.overall ? 0 : 1);
}

async function runWatchMode(config: UniversalDbTestConfig, options: CliOptions) {
  console.log(chalk.yellow('👀 Watch mode active - press Ctrl+C to exit'));
  
  const runTest = async () => {
    console.clear();
    console.log(chalk.blue(`🔄 Running tests at ${new Date().toLocaleTimeString()}`));
    
    const tester = new UniversalDatabaseTest(config);
    const result = await tester.runTestSuite();
    printTestResults(result, options.verbose);
  };

  // Initial run
  await runTest();

  // Watch for changes (simple file watcher)
  setInterval(async () => {
    await runTest();
  }, 10000); // Run every 10 seconds
}

function printTestResults(result: any, verbose: boolean = false) {
  console.log();
  console.log(result.overall ? 
    chalk.green('✅ All database tests passed!') : 
    chalk.red('❌ Some database tests failed!')
  );
  
  console.log(chalk.gray(`Duration: ${result.duration}ms`));
  console.log();

  result.results.forEach((test: any) => {
    const icon = test.success ? '✅' : '❌';
    const color = test.success ? chalk.green : chalk.red;
    
    console.log(`${icon} ${color(test.operation.toUpperCase())} ${test.duration ? `(${test.duration}ms)` : ''}`);
    
    if (test.error) {
      console.log(`   ${chalk.red('Error:')} ${test.error}`);
    }
    
    if (verbose && test.details) {
      console.log(`   ${chalk.gray('Details:')} ${JSON.stringify(test.details, null, 2)}`);
    }
  });
  
  console.log();
}

async function generateSetupFiles(databaseType: string, outputDir: string) {
  const templateDir = path.join(__dirname, '../templates');
  
  // Generate migration files
  const migrationContent = getMigrationTemplate(databaseType);
  const migrationPath = path.join(outputDir, 'migrations', `001_create_db_test_table.sql`);
  
  fs.mkdirSync(path.dirname(migrationPath), { recursive: true });
  fs.writeFileSync(migrationPath, migrationContent);
  
  // Generate config file
  const configContent = getConfigTemplate(databaseType);
  const configPath = path.join(outputDir, 'db-test.config.json');
  fs.writeFileSync(configPath, configContent);
  
  // Generate environment file template
  const envContent = getEnvTemplate(databaseType);
  const envPath = path.join(outputDir, '.env.example');
  fs.writeFileSync(envPath, envContent);
  
  console.log(chalk.green(`Generated files:`));
  console.log(`  ${migrationPath}`);
  console.log(`  ${configPath}`);
  console.log(`  ${envPath}`);
}

async function initializeConfig() {
  const configPath = path.join(process.cwd(), 'db-test.config.json');
  
  if (fs.existsSync(configPath)) {
    throw new Error('Configuration file already exists');
  }
  
  const defaultConfig = {
    database: {
      type: "postgresql",
      connectionString: "${DATABASE_URL}",
      ssl: true
    },
    tableName: "db_connection_test",
    autoCreateTable: true,
    cleanupAfterTest: true,
    timeoutMs: 30000,
    retryAttempts: 3
  };
  
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log(`Created: ${configPath}`);
}

function getMigrationTemplate(databaseType: string): string {
  switch (databaseType) {
    case 'postgresql':
    case 'supabase':
      return `-- Universal Database Test Table
CREATE TABLE IF NOT EXISTS db_connection_test (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE db_connection_test IS 'Universal database connection test table';
`;
    case 'mysql':
      return `-- Universal Database Test Table
CREATE TABLE IF NOT EXISTS db_connection_test (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  test_message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
    default:
      return '-- Custom migration - please adapt for your database type\n';
  }
}

function getConfigTemplate(databaseType: string): string {
  const config = {
    database: {
      type: databaseType,
      connectionString: "${DATABASE_URL}"
    },
    tableName: "db_connection_test",
    autoCreateTable: true,
    cleanupAfterTest: true,
    timeoutMs: 30000,
    retryAttempts: 3
  };
  
  return JSON.stringify(config, null, 2);
}

function getEnvTemplate(databaseType: string): string {
  switch (databaseType) {
    case 'supabase':
      return `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
`;
    default:
      return `# Database Configuration
DATABASE_URL=your_connection_string
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_database
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=true
`;
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error(chalk.red('Unhandled rejection:'), error);
  process.exit(1);
});

program.parse();