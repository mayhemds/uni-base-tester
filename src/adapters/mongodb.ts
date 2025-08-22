// src/adapters/mongodb.ts
import { DatabaseAdapter, DatabaseConfig, TestResult } from '../types';

export class MongoDBAdapter implements DatabaseAdapter {
  constructor(config: DatabaseConfig, tableName: string = 'db_connection_test') {
    throw new Error('MongoDB adapter requires "mongodb" package. Install it with: npm install mongodb');
  }

  async connect(): Promise<void> {
    throw new Error('MongoDB adapter not implemented');
  }

  async disconnect(): Promise<void> {
    // No-op
  }

  async createTestTable(): Promise<void> {
    throw new Error('MongoDB adapter not implemented');
  }

  async testRead(): Promise<TestResult> {
    return { success: false, operation: 'read', error: 'MongoDB adapter not implemented' };
  }

  async testWrite(message: string): Promise<TestResult> {
    return { success: false, operation: 'write', error: 'MongoDB adapter not implemented' };
  }

  async testDelete(id: string): Promise<TestResult> {
    return { success: false, operation: 'delete', error: 'MongoDB adapter not implemented' };
  }

  async healthCheck(): Promise<TestResult> {
    return { success: false, operation: 'connection', error: 'MongoDB adapter not implemented' };
  }
}
