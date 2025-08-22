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
