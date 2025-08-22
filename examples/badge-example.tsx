// examples/badge-example.tsx
import React from 'react';
import { DatabaseStatusBadge } from '@yourname/universal-db-test/react';

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
      
      {/* Floating database status badge */}
      <DatabaseStatusBadge 
        config={dbConfig}
        position="top-right"
        showDetails={true}
        refreshInterval={30000}
        onClick={(status) => console.log('Database status:', status)}
      />
    </div>
  );
}

export default App;
