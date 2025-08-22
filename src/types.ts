// src/types.ts
export interface DatabaseConfig {
  type: 'postgresql' | 'mysql' | 'mongodb' | 'supabase' | 'custom';
  connectionString?: string;
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  // Supabase specific
  supabaseUrl?: string;
  supabaseKey?: string;
  supabaseServiceKey?: string;
  // Custom adapter
  customAdapter?: DatabaseAdapter;
}

export interface TestRecord {
  id: string;
  test_message: string;
  created_at: string | Date;
}

export interface TestResult {
  success: boolean;
  operation: 'read' | 'write' | 'delete' | 'connection';
  error?: string;
  duration?: number;
  details?: any;
}

export interface TestSuite {
  overall: boolean;
  results: TestResult[];
  duration: number;
  timestamp: string;
}

export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  testRead(): Promise<TestResult>;
  testWrite(message: string): Promise<TestResult>;
  testDelete(id: string): Promise<TestResult>;
  createTestTable(): Promise<void>;
  dropTestTable?(): Promise<void>;
  healthCheck?(): Promise<TestResult>;
}

export interface UniversalDbTestConfig {
  database: DatabaseConfig;
  tableName?: string;
  autoCreateTable?: boolean;
  cleanupAfterTest?: boolean;
  timeoutMs?: number;
  retryAttempts?: number;
  silent?: boolean;
  beforeTest?: () => Promise<void>;
  afterTest?: (result: TestSuite) => Promise<void>;
}

export interface ReactComponentProps {
  config: UniversalDbTestConfig;
  onTestComplete?: (result: TestSuite) => void;
  showDetailedResults?: boolean;
  autoTest?: boolean;
  className?: string;
}

// CLI Options
export interface CliOptions {
  config?: string;
  database?: string;
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  ssl?: boolean;
  table?: string;
  verbose?: boolean;
  json?: boolean;
  watch?: boolean;
  setup?: boolean;
}