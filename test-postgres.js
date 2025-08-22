const { testDatabase } = require('./dist/index.js');

async function test() {
  try {
    const result = await testDatabase({
      database: {
        type: 'postgresql',
        connectionString: 'postgresql://localhost:5432/postgres' // adjust as needed
      }
    });
    console.log('Test result:', result.overall ? '✅ Success' : '❌ Failed');
  } catch (error) {
    console.log('Expected error (no DB configured):', error.message);
  }
}

test();
