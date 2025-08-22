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
        setMessage('Database connected successfully!');
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
        setMessage('Database connection failed');
        const failedTest = result.results.find(r => !r.success);
        setDetails(failedTest?.error || 'Unknown error occurred');
        
        if (onError) onError(failedTest?.error || 'Connection failed');
      }
    } catch (error) {
      setStatus('failed');
      setMessage('Database connection error');
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
      backgroundColor: 'transparent',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      zIndex: 1000,
      pointerEvents: 'none' as const,
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '1.5rem',
      width: '350px',
      maxWidth: '350px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      border: '1px solid #e1e5e9',
      margin: '20px',
      animation: 'slideInUp 0.3s ease-out',
      pointerEvents: 'auto' as const,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '1rem',
      paddingBottom: '0.75rem',
      borderBottom: '1px solid #e1e5e9',
    },
    trafficLight: {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      marginRight: '0.75rem',
      backgroundColor: status === 'connected' ? '#22c55e' : status === 'failed' ? '#ef4444' : '#f59e0b',
      animation: status === 'testing' ? 'pulse 2s infinite' : 'none',
    },
    icon: {
      fontSize: '1rem',
      marginRight: '0.75rem',
      display: 'flex',
      alignItems: 'center',
      color: status === 'connected' ? '#22c55e' : status === 'failed' ? '#ef4444' : '#6b7280',
      fontWeight: '600',
    },
    title: {
      margin: 0,
      fontSize: '1.1rem',
      fontWeight: '500',
      color: '#374151',
    },
    message: {
      fontSize: '0.95rem',
      marginBottom: '0.75rem',
      fontWeight: '400',
      color: '#6b7280',
      lineHeight: '1.4',
    },
    details: {
      fontSize: '0.8rem',
      color: '#9ca3af',
      marginBottom: '1rem',
      padding: '0.5rem',
      backgroundColor: '#f8fafc',
      borderRadius: '4px',
      border: '1px solid #e2e8f0',
      fontFamily: 'monospace',
    },
    buttons: {
      display: 'flex',
      gap: '0.5rem',
      justifyContent: 'flex-end',
    },
    button: {
      padding: '0.5rem 1rem',
      borderRadius: '4px',
      border: '1px solid #d1d5db',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: '400',
      transition: 'all 0.15s ease',
      backgroundColor: 'white',
      disabled: isRetrying,
    },
    dangerButton: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: '1px solid #ef4444',
    },
    secondaryButton: {
      backgroundColor: 'white',
      color: '#6b7280',
      border: '1px solid #d1d5db',
    },
  };

  const getIcon = () => {
    switch (status) {
      case 'testing': 
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{animation: 'spin 2s linear infinite'}}>
            <path d="M21 12a9 9 0 11-6.219-8.56"/>
          </svg>
        );
      case 'connected': return '✓';
      case 'failed': return '!';
      default: return '?';
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'testing': return 'Testing Connection';
      case 'connected': return 'Connected';
      case 'failed': return 'Connection Failed';
      default: return 'Database Status';
    }
  };

  return (
    <>
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      <div style={modalStyles.overlay}>
        <div style={modalStyles.modal}>
          <div style={modalStyles.header}>
            <div style={modalStyles.trafficLight}></div>
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
                {isRetrying ? 'Retrying...' : 'Retry Connection'}
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
