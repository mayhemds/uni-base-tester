// src/adapters/mysql.ts
import { DatabaseAdapter, DatabaseConfig, TestResult } from '../types';

export class MySQLAdapter implements DatabaseAdapter {
  constructor(config: DatabaseConfig, tableName: string = 'db_connection_test') {
    throw new Error('MySQL adapter requires "mysql2" package. Install it with: npm install mysql2');
  }

  async connect(): Promise<void> {
    throw new Error('MySQL adapter not implemented');
  }

  async disconnect(): Promise<void> {
    // No-op
  }

  async createTestTable(): Promise<void> {
    throw new Error('MySQL adapter not implemented');
  }

  async testRead(): Promise<TestResult> {
    return { success: false, operation: 'read', error: 'MySQL adapter not implemented' };
  }

  async testWrite(message: string): Promise<TestResult> {
    return { success: false, operation: 'write', error: 'MySQL adapter not implemented' };
  }

  async testDelete(id: string): Promise<TestResult> {
    return { success: false, operation: 'delete', error: 'MySQL adapter not implemented' };
  }

  async healthCheck(): Promise<TestResult> {
    return { success: false, operation: 'connection', error: 'MySQL adapter not implemented' };
  }
}
