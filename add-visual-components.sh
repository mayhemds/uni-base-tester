#!/bin/bash
# add-visual-components.sh - Add visual database status components

set -e

echo "🎨 Adding Visual Database Status Components to Universal DB Test"
echo "================================================================"

# Step 1: Install React dependencies
echo ""
echo "📦 Installing React dependencies..."
npm install react react-dom @types/react @types/react-dom

echo "✅ React dependencies installed"

# Step 2: Create DatabaseStatusModal component
echo ""
echo "🎭 Creating DatabaseStatusModal component..."
cat > src/react-components/DatabaseStatusModal.tsx << 'MODAL'
// src/react-components/DatabaseStatusModal.tsx
import React, { useState, useEffect } from 'react';
import { UniversalDatabaseTest } from '../index';

interface DatabaseStatusModalProps {
  config: any;
  showOnStartup?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
  onClose?: () => void;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const DatabaseStatusModal: React.FC<DatabaseStatusModalProps> = ({
  config,
  showOnStartup = true,
  autoHide = true,
  autoHideDelay = 3000,
  onClose,
  onSuccess,
  onError
}) => {
  const [isVisible, setIsVisible] = useState(showOnStartup);
  const [status, setStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [message, setMessage] = useState('Testing database connection...');
  const [details, setDetails] = useState<string>('');
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (showOnStartup) {
      testConnection();
    }
  }, []);

  const testConnection = async () => {
    setStatus('testing');
    setMessage('Testing database connection...');
    setDetails('');
    setIsVisible(true);
    setIsRetrying(false);

    try {
      const tester = new UniversalDatabaseTest({
        ...config,
        silent: true,
        timeoutMs: 10000
      });
      const result = await tester.runTestSuite();

      if (result.overall) {
        setStatus('connected');
        setMessage('✅ Database connected successfully!');
        setDetails(`Connection verified in ${result.duration}ms`);
        
        if (onSuccess) onSuccess();
        
        if (autoHide) {
          setTimeout(() => {
            setIsVisible(false);
            if (onClose) onClose();
          }, autoHideDelay);
        }
      } else {
        setStatus('failed');
        setMessage('❌ Database connection failed');
        const failedTest = result.results.find(r => !r.success);
        setDetails(failedTest?.error || 'Unknown error occurred');
        
        if (onError) onError(failedTest?.error || 'Connection failed');
      }
    } catch (error) {
      setStatus('failed');
      setMessage('❌ Database connection error');
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      setDetails(errorMsg);
      
      if (onError) onError(errorMsg);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    await testConnection();
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const modalStyles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '2rem',
      minWidth: '400px',
      maxWidth: '500px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      border: '1px solid #e5e7eb',
      transform: 'scale(1)',
      animation: 'modalAppear 0.3s ease-out',
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1.5rem',
      paddingBottom: '1rem',
      borderBottom: '1px solid #f3f4f6',
    },
    icon: {
      fontSize: '2.5rem',
      marginRight: '1rem',
      animation: status === 'testing' ? 'spin 2s linear infinite' : 'none',
    },
    title: {
      margin: 0,
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#111827',
    },
    message: {
      fontSize: '1.1rem',
      marginBottom: '1rem',
      fontWeight: '500',
      color: status === 'connected' ? '#059669' : status === 'failed' ? '#dc2626' : '#6b7280',
    },
    details: {
      fontSize: '0.875rem',
      color: '#6b7280',
      marginBottom: '1.5rem',
      padding: '0.75rem',
      backgroundColor: '#f9fafb',
      borderRadius: '6px',
      border: '1px solid #e5e7eb',
      fontFamily: 'monospace',
    },
    buttons: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'all 0.2s ease',
      disabled: isRetrying,
    },
    primaryButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
      boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)',
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#374151',
      border: '1px solid #d1d5db',
    },
  };

  const getIcon = () => {
    switch (status) {
      case 'testing': return '🔄';
      case 'connected': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'testing': return 'Testing Database Connection';
      case 'connected': return 'Database Connected';
      case 'failed': return 'Database Connection Failed';
      default: return 'Database Status';
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalAppear {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      <div style={modalStyles.overlay} onClick={handleClose}>
        <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={modalStyles.header}>
            <span style={modalStyles.icon}>{getIcon()}</span>
            <h2 style={modalStyles.title}>{getTitle()}</h2>
          </div>
          
          <div style={modalStyles.message}>{message}</div>
          
          {details && (
            <div style={modalStyles.details}>{details}</div>
          )}
          
          <div style={modalStyles.buttons}>
            {status === 'failed' && (
              <button
                style={{ 
                  ...modalStyles.button, 
                  ...modalStyles.dangerButton,
                  opacity: isRetrying ? 0.6 : 1 
                }}
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? '🔄 Retrying...' : '🔄 Retry Connection'}
              </button>
            )}
            <button
              style={{ ...modalStyles.button, ...modalStyles.secondaryButton }}
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DatabaseStatusModal;
MODAL

echo "✅ DatabaseStatusModal created"

# Step 3: Create DatabaseStatusBadge component
echo ""
echo "🏷️ Creating DatabaseStatusBadge component..."
cat > src/react-components/DatabaseStatusBadge.tsx << 'BADGE'
// src/react-components/DatabaseStatusBadge.tsx
import React, { useState, useEffect } from 'react';
import { UniversalDatabaseTest } from '../index';

interface DatabaseStatusBadgeProps {
  config: any;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showDetails?: boolean;
  refreshInterval?: number;
  onClick?: (status: string) => void;
}

const DatabaseStatusBadge: React.FC<DatabaseStatusBadgeProps> = ({
  config,
  position = 'top-right',
  showDetails = false,
  refreshInterval = 30000,
  onClick
}) => {
  const [status, setStatus] = useState<'testing' | 'connected' | 'failed'>('testing');
  const [isExpanded, setIsExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    testConnection();
    const interval = setInterval(testConnection, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const testConnection = async () => {
    setStatus('testing');
    try {
      const tester = new UniversalDatabaseTest({ 
        ...config, 
        silent: true,
        timeoutMs: 5000 
      });
      const result = await tester.quickTest();
      const newStatus = result ? 'connected' : 'failed';
      setStatus(newStatus);
      setMessage(result ? 'Database is healthy' : 'Database is unavailable');
      setLastChecked(new Date());
      
      if (onClick) onClick(newStatus);
    } catch (error) {
      setStatus('failed');
      setMessage('Connection error occurred');
      setLastChecked(new Date());
      
      if (onClick) onClick('failed');
    }
  };

  const handleClick = () => {
    setIsExpanded(!isExpanded);
    testConnection();
  };

  const getPositionStyles = () => {
    const base = {
      position: 'fixed' as const,
      zIndex: 999,
      padding: '0.5rem 1rem',
      borderRadius: '20px',
      fontSize: '0.875rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      userSelect: 'none' as const,
      backdropFilter: 'blur(8px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
    };

    const positions = {
      'top-right': { top: '1rem', right: '1rem' },
      'top-left': { top: '1rem', left: '1rem' },
      'bottom-right': { bottom: '1rem', right: '1rem' },
      'bottom-left': { bottom: '1rem', left: '1rem' },
    };

    return { ...base, ...positions[position] };
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'connected':
        return {
          backgroundColor: 'rgba(16, 185, 129, 0.9)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.4)',
        };
      case 'failed':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
        };
      case 'testing':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.9)',
          color: 'white',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.4)',
        };
      default:
        return {};
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'connected': return '🟢';
      case 'failed': return '🔴';
      case 'testing': return '🟡';
      default: return '⚪';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'DB Online';
      case 'failed': return 'DB Offline';
      case 'testing': return 'Checking...';
      default: return 'DB Status';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .db-badge-testing {
          animation: pulse 2s infinite;
        }
      `}</style>
      <div
        style={{ ...getPositionStyles(), ...getStatusStyles() }}
        className={status === 'testing' ? 'db-badge-testing' : ''}
        onClick={handleClick}
        title={`${message}${lastChecked ? ` (Last checked: ${formatTime(lastChecked)})` : ''}`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span>{getIcon()}</span>
          <span>{getStatusText()}</span>
        </div>
        
        {isExpanded && showDetails && (
          <div style={{ 
            marginTop: '0.75rem', 
            fontSize: '0.75rem',
            opacity: 0.9,
            borderTop: '1px solid rgba(255, 255, 255, 0.3)',
            paddingTop: '0.5rem',
            minWidth: '200px'
          }}>
            <div>{message}</div>
            {lastChecked && (
              <div style={{ marginTop: '0.25rem', opacity: 0.8 }}>
                Last: {formatTime(lastChecked)}
              </div>
            )}
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: '0.7rem',
              opacity: 0.7 
            }}>
              Click to refresh
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default DatabaseStatusBadge;
BADGE

echo "✅ DatabaseStatusBadge created"

# Step 4: Update React components index
echo ""
echo "📝 Updating React components index..."
cat > src/react-components/index.ts << 'INDEX'
// src/react-components/index.ts
export { DatabaseTestComponent, DatabaseTestProvider } from './DatabaseTestComponent';
export { default as DatabaseStatusModal } from './DatabaseStatusModal';
export { default as DatabaseStatusBadge } from './DatabaseStatusBadge';
export type { ReactComponentProps } from '../types';
INDEX

echo "✅ React components index updated"

# Step 5: Rebuild the package
echo ""
echo "🔨 Rebuilding package with visual components..."
npm run build

echo "✅ Package rebuilt successfully"

# Step 6: Create usage examples
echo ""
echo "📋 Creating usage examples..."
mkdir -p examples

cat > examples/modal-example.tsx << 'EXAMPLE1'
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
EXAMPLE1

cat > examples/badge-example.tsx << 'EXAMPLE2'
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
EXAMPLE2

echo "✅ Usage examples created"

echo ""
echo "🎉 Visual Database Status Components Successfully Added!"
echo "======================================================="
echo ""
echo "📦 Added Components:"
echo "  ✅ DatabaseStatusModal - Popup modal showing connection status"
echo "  ✅ DatabaseStatusBadge - Floating status badge"
echo ""
echo "🚀 Quick Usage:"
echo ""
echo "1. Import in your React app:"
echo "   import { DatabaseStatusModal } from './dist/react-components';"
echo ""
echo "2. Use the modal component:"
echo "   <DatabaseStatusModal config={dbConfig} showOnStartup={true} />"
echo ""
echo "3. Or use the floating badge:"
echo "   <DatabaseStatusBadge config={dbConfig} position=\"top-right\" />"
echo ""
echo "📚 Check the examples/ directory for complete usage examples!"
echo ""
echo "✨ Your visual database status components are ready to use!"
