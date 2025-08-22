// src/index.ts
import { DatabaseAdapter, UniversalDbTestConfig, TestSuite, TestResult } from './types';
import { PostgreSQLAdapter, MySQLAdapter, MongoDBAdapter, SupabaseAdapter } from './adapters';




export class UniversalDatabaseTest {
  private adapter: DatabaseAdapter;
  private config: UniversalDbTestConfig;

  constructor(config: UniversalDbTestConfig) {
    this.config = {
      tableName: 'db_connection_test',
      autoCreateTable: true,
      cleanupAfterTest: true,
      timeoutMs: 30000,
      retryAttempts: 3,
      silent: false,
      ...config
    };

    this.adapter = this.createAdapter();
  }

  private createAdapter(): DatabaseAdapter {
    const { database } = this.config;

    switch (database.type) {
      case 'postgresql':
        return new PostgreSQLAdapter(database, this.config.tableName!);
      case 'mysql':
        return new MySQLAdapter(database, this.config.tableName!);
      case 'mongodb':
        return new MongoDBAdapter(database, this.config.tableName!);
      case 'supabase':
        return new SupabaseAdapter(database, this.config.tableName!);
      case 'custom':
        if (!database.customAdapter) {
          throw new Error('Custom adapter must be provided when type is "custom"');
        }
        return database.customAdapter;
      default:
        throw new Error(`Unsupported database type: ${database.type}`);
    }
  }

  /**
   * Run the complete database test suite
   */
  async runTestSuite(): Promise<TestSuite> {
    const startTime = Date.now();
    const results: TestResult[] = [];
    let overall = false;

    try {
      if (!this.config.silent) {
        console.log('🔄 Starting database connection test suite...');
      }

      // Run beforeTest hook
      if (this.config.beforeTest) {
        await this.config.beforeTest();
      }

      // Connect to database
      await this.withTimeout(this.adapter.connect(), 'Connection failed');
      
      // Create test table if needed
      if (this.config.autoCreateTable) {
        await this.adapter.createTestTable();
      }

      // Run tests with retry logic
      const readResult = await this.runWithRetry(() => this.adapter.testRead(), 'read');
      results.push(readResult);

      const writeResult = await this.runWithRetry(() => 
        this.adapter.testWrite(`Test message at ${new Date().toISOString()}`), 'write'
      );
      results.push(writeResult);

      // Extract ID from write result for delete test
      const recordId = writeResult.details?.id || writeResult.details?.insertedId;
      if (recordId) {
        const deleteResult = await this.runWithRetry(() => 
          this.adapter.testDelete(recordId), 'delete'
        );
        results.push(deleteResult);
      }

      // Health check if available
      if (this.adapter.healthCheck) {
        const healthResult = await this.runWithRetry(() => 
          this.adapter.healthCheck!(), 'health'
        );
        results.push(healthResult);
      }

      overall = results.every(result => result.success);

      if (!this.config.silent) {
        console.log(overall ? '✅ All database tests passed!' : '❌ Some database tests failed');
      }

    } catch (error) {
      results.push({
        success: false,
        operation: 'connection',
        error: error instanceof Error ? error.message : String(error)
      });
      
      if (!this.config.silent) {
        console.error('❌ Database test suite failed:', error);
      }
    } finally {
      // Cleanup
      try {
        if (this.config.cleanupAfterTest && this.adapter.dropTestTable) {
          await this.adapter.dropTestTable();
        }
        await this.adapter.disconnect();
      } catch (cleanupError) {
        if (!this.config.silent) {
          console.warn('⚠️ Cleanup warning:', cleanupError);
        }
      }
    }

    const testSuite: TestSuite = {
      overall,
      results,
      duration: Date.now() - startTime,
      timestamp: new Date().toISOString()
    };

    // Run afterTest hook
    if (this.config.afterTest) {
      await this.config.afterTest(testSuite);
    }

    return testSuite;
  }

  /**
   * Quick connection test (read-only)
   */
  async quickTest(): Promise<boolean> {
    try {
      await this.adapter.connect();
      const result = await this.adapter.testRead();
      await this.adapter.disconnect();
      return result.success;
    } catch {
      return false;
    }
  }

  private async withTimeout<T>(promise: Promise<T>, operation: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`${operation} timeout after ${this.config.timeoutMs}ms`)), 
        this.config.timeoutMs)
      )
    ]);
  }

  private async runWithRetry(
    operation: () => Promise<TestResult>,
    operationName: string
  ): Promise<TestResult> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const startTime = Date.now();
        const result = await operation();
        result.duration = Date.now() - startTime;
        
        if (result.success || attempt === this.config.retryAttempts) {
          return result;
        }
        
        lastError = new Error(result.error || 'Unknown error');
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === this.config.retryAttempts) {
          return {
            success: false,
            operation: operationName as any,
            error: lastError.message
          };
        }
      }

      // Wait before retry (exponential backoff)
      if (attempt < this.config.retryAttempts!) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }

    return {
      success: false,
      operation: operationName as any,
      error: lastError?.message || 'Max retries exceeded'
    };
  }
}

// Convenience functions
export async function testDatabase(config: UniversalDbTestConfig): Promise<TestSuite> {
  const tester = new UniversalDatabaseTest(config);
  return tester.runTestSuite();
}

export async function quickDatabaseTest(config: UniversalDbTestConfig): Promise<boolean> {
  const tester = new UniversalDatabaseTest(config);
  return tester.quickTest();
}

// Export types
export * from './types';
export * from './adapters';
export * from './react-components';