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
