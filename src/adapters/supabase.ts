// src/adapters/supabase.ts
import { DatabaseAdapter, DatabaseConfig, TestResult } from '../types';

export class SupabaseAdapter implements DatabaseAdapter {
  constructor(config: DatabaseConfig, tableName: string = 'db_connection_test') {
    throw new Error('Supabase adapter requires "@supabase/supabase-js" package. Install it with: npm install @supabase/supabase-js');
  }

  async connect(): Promise<void> {
    throw new Error('Supabase adapter not implemented');
  }

  async disconnect(): Promise<void> {
    // No-op
  }

  async createTestTable(): Promise<void> {
    throw new Error('Supabase adapter not implemented');
  }

  async testRead(): Promise<TestResult> {
    return { success: false, operation: 'read', error: 'Supabase adapter not implemented' };
  }

  async testWrite(message: string): Promise<TestResult> {
    return { success: false, operation: 'write', error: 'Supabase adapter not implemented' };
  }

  async testDelete(id: string): Promise<TestResult> {
    return { success: false, operation: 'delete', error: 'Supabase adapter not implemented' };
  }

  async healthCheck(): Promise<TestResult> {
    return { success: false, operation: 'connection', error: 'Supabase adapter not implemented' };
  }
}
