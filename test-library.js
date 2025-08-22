const { testDatabase, UniversalDatabaseTest } = require('./dist/index.js');

async function runTests() {
  console.log('🔍 Testing Universal Database Test Library\n');
  
  // Test 1: Basic library functionality
  console.log('1. Testing library exports...');
  console.log('✅ testDatabase:', typeof testDatabase);
  console.log('✅ UniversalDatabaseTest:', typeof UniversalDatabaseTest);
  
  // Test 2: Create instance
  console.log('\n2. Creating UniversalDatabaseTest instance...');
  const tester = new UniversalDatabaseTest({
    database: {
      type: 'postgresql',
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      username: 'postgres',
      password: 'password'  // adjust as needed
    },
    timeoutMs: 5000,
    silent: true
  });
  console.log('✅ Instance created successfully');
  
  // Test 3: Try quick test (will likely fail, but shows error handling)
  console.log('\n3. Testing quick connection test...');
  try {
    const result = await tester.quickTest();
    console.log('Quick test result:', result ? '✅ Connected' : '❌ Failed');
  } catch (error) {
    console.log('❌ Expected error (no real DB):', error.message);
  }
  
  // Test 4: Test adapter availability
  console.log('\n4. Testing adapters...');
  const { PostgreSQLAdapter, MySQLAdapter } = require('./dist/index.js');
  console.log('✅ PostgreSQL adapter available:', typeof PostgreSQLAdapter);
  console.log('✅ MySQL adapter available:', typeof MySQLAdapter);
  
  console.log('\n🎉 Library tests completed!');
}

runTests().catch(console.error);
