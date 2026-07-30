import React from 'react';
import { Spinner } from '../common/Spinner';

export const LoadingScreen = ({ message = 'Loading Synapse...' }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', backgroundColor: 'var(--bg-primary)' }}>
      <Spinner size="lg" />
      <p className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>{message}</p>
    </div>
  );
};
