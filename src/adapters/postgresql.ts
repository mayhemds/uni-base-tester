// src/adapters/postgresql.ts
import { Pool, Client } from 'pg';
import { DatabaseAdapter, DatabaseConfig, TestResult } from '../types';

export class PostgreSQLAdapter implements DatabaseAdapter {
  private pool: Pool | null = null;
  private config: DatabaseConfig;
  private tableName: string;

  constructor(config: DatabaseConfig, tableName: string = 'db_connection_test') {
    this.config = config;
    this.tableName = tableName;
  }

  async connect(): Promise<void> {
    try {
      const poolConfig = this.config.connectionString 
        ? { connectionString: this.config.connectionString, ssl: this.config.ssl }
        : {
            host: this.config.host,
            port: this.config.port || 5432,
            database: this.config.database,
            user: this.config.username,
            password: this.config.password,
            ssl: this.config.ssl
          };

      this.pool = new Pool(poolConfig);
      
      // Test the connection
      const client = await this.pool.connect();
      client.release();
    } catch (error) {
      throw new Error(`PostgreSQL connection failed: ${error instanceof Error ? error.message : error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }

  async createTestTable(): Promise<void> {
    if (!this.pool) throw new Error('Not connected to database');

    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        test_message TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      COMMENT ON TABLE ${this.tableName} IS 'Universal database connection test table';
    `;

    try {
      await this.pool.query(createTableQuery);
    } catch (error) {
      throw new Error(`Failed to create test table: ${error instanceof Error ? error.message : error}`);
    }
  }

  async dropTestTable(): Promise<void> {
    if (!this.pool) return;

    try {
      await this.pool.query(`DROP TABLE IF EXISTS ${this.tableName}`);
    } catch (error) {
      // Silent fail for cleanup
      console.warn(`Failed to drop test table: ${error}`);
    }
  }

  async testRead(): Promise<TestResult> {
    if (!this.pool) {
      return { success: false, operation: 'read', error: 'Not connected to database' };
    }

    try {
      const result = await this.pool.query(
        `SELECT id, test_message, created_at FROM ${this.tableName} ORDER BY created_at DESC LIMIT 5`
      );

      return {
        success: true,
        operation: 'read',
        details: {
          rowCount: result.rowCount,
          rows: result.rows
        }
      };
    } catch (error) {
      return {
        success: false,
        operation: 'read',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async testWrite(message: string): Promise<TestResult> {
    if (!this.pool) {
      return { success: false, operation: 'write', error: 'Not connected to database' };
    }

    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.tableName} (test_message) VALUES ($1) RETURNING id, test_message, created_at`,
        [message]
      );

      return {
        success: true,
        operation: 'write',
        details: {
          id: result.rows[0].id,
          insertedRow: result.rows[0]
        }
      };
    } catch (error) {
      return {
        success: false,
        operation: 'write',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async testDelete(id: string): Promise<TestResult> {
    if (!this.pool) {
      return { success: false, operation: 'delete', error: 'Not connected to database' };
    }

    try {
      const result = await this.pool.query(
        `DELETE FROM ${this.tableName} WHERE id = $1`,
        [id]
      );

      return {
        success: true,
        operation: 'delete',
        details: {
          deletedCount: result.rowCount
        }
      };
    } catch (error) {
      return {
        success: false,
        operation: 'delete',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async healthCheck(): Promise<TestResult> {
    if (!this.pool) {
      return { success: false, operation: 'connection', error: 'Not connected to database' };
    }

    try {
      const result = await this.pool.query('SELECT NOW() as server_time, version() as server_version');
      
      return {
        success: true,
        operation: 'connection',
        details: {
          serverTime: result.rows[0].server_time,
          serverVersion: result.rows[0].server_version,
          poolSize: this.pool.totalCount,
          idleConnections: this.pool.idleCount
        }
      };
    } catch (error) {
      return {
        success: false,
        operation: 'connection',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}