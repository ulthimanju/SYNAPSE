import React from 'react';
import { Spinner } from '../common/Spinner';

export const ProcessingIndicator = ({ text = 'Processing document...' }) => {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--accent-amber)' }}>
      <Spinner size="sm" />
      <span>{text}</span>
    </div>
  );
};
