// src/react-components/DatabaseTestComponent.tsx
import { ReactComponentProps, TestSuite, TestResult } from '../types';

// Simple non-React version for compilation
export const DatabaseTestComponent = (props: ReactComponentProps) => {
  throw new Error('React components require React to be installed. Install with: npm install react react-dom @types/react @types/react-dom');
};

export const DatabaseTestProvider = (props: {
  config: ReactComponentProps['config'];
  children: any;
  fallback?: any;
  showTestUI?: boolean;
}) => {
  throw new Error('React components require React to be installed. Install with: npm install react react-dom @types/react @types/react-dom');
};

export default DatabaseTestComponent;
