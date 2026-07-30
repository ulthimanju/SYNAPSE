import React from 'react';

export const Toast = ({ message, onClose }) => {
  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-md)',
      padding: '0.75rem 1.25rem',
      borderRadius: 'var(--radius-sm)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      zIndex: 1000,
    }}>
      <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>}
    </div>
  );
};
