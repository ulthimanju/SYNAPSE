import React from 'react';

export const Alert = ({ type = 'info', title, message }) => {
  return (
    <div style={{
      padding: '1rem',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--accent-amber)',
      backgroundColor: 'var(--accent-light)',
      color: 'var(--accent-amber-hover)',
      marginBottom: '1rem',
    }}>
      {title && <h4 className="font-serif" style={{ marginBottom: '0.25rem', fontWeight: 600 }}>{title}</h4>}
      <p style={{ fontSize: '0.875rem' }}>{message}</p>
    </div>
  );
};
