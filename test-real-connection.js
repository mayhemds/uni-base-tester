const { testDatabase } = require('./dist/index.js');

async function testConnection() {
  console.log('🔍 Testing Universal Database Test package...\n');
  
  try {
    // Test 1: Try without a real database (should fail gracefully)
    console.log('Test 1: Testing without real database...');
    const result1 = await testDatabase({
      database: {
        type: 'postgresql',
        host: 'nonexistent-host',
        port: 5432,
        database: 'test'
      },
      timeoutMs: 5000,
      silent: true
    });
    console.log('Result:', result1.overall ? '✅ Success' : '❌ Failed (expected)');
    console.log('Error:', result1.results.find(r => !r.success)?.error);
    
  } catch (error) {
    console.log('❌ Expected error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Test the adapter classes directly
  console.log('Test 2: Testing adapter availability...');
  const { PostgreSQLAdapter, MySQLAdapter, MongoDBAdapter, SupabaseAdapter } = require('./dist/index.js');
  
  console.log('✅ PostgreSQLAdapter:', typeof PostgreSQLAdapter);
  console.log('✅ MySQLAdapter:', typeof MySQLAdapter);  
  console.log('✅ MongoDBAdapter:', typeof MongoDBAdapter);
  console.log('✅ SupabaseAdapter:', typeof SupabaseAdapter);
  
  // Test 3: Test MySQL adapter (should show helpful error)
  console.log('\nTest 3: Testing MySQL adapter without driver...');
  try {
    new MySQLAdapter({type: 'mysql'}, 'test');
  } catch (error) {
    console.log('✅ Expected MySQL error:', error.message);
  }
}

testConnection();
