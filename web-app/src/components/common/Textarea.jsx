import React from 'react';

export const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      {label && <label style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>{label}</label>}
      <textarea
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          fontSize: '0.875rem',
          outline: 'none',
          minHeight: '100px',
        }}
        {...props}
      />
      {error && <span style={{ fontSize: '0.75rem', color: '#DC2626' }}>{error}</span>}
    </div>
  );
};
