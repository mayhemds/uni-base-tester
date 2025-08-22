// examples/modal-example.tsx
import React from 'react';
import { DatabaseStatusModal } from '@yourname/universal-db-test/react';

function App() {
  const dbConfig = {
    database: {
      type: 'postgresql',
      connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/postgres'
    }
  };

  return (
    <div>
      <h1>My Application</h1>
      <p>Your app content goes here...</p>
      
      {/* Database status modal - shows on startup */}
      <DatabaseStatusModal 
        config={dbConfig}
        showOnStartup={true}
        autoHide={true}
        autoHideDelay={3000}
        onSuccess={() => console.log('Database connected!')}
        onError={(error) => console.error('Database error:', error)}
        onClose={() => console.log('Modal closed')}
      />
    </div>
  );
}

export default App;
