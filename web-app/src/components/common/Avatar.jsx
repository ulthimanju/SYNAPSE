import React from 'react';

export const Avatar = ({ name = 'User', size = 'md' }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  const dims = size === 'sm' ? '32px' : size === 'lg' ? '48px' : '40px';
  return (
    <div style={{
      width: dims,
      height: dims,
      borderRadius: '50%',
      backgroundColor: 'var(--accent-light)',
      color: 'var(--accent-amber-hover)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontFamily: 'var(--font-mono)',
      fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
      border: '1px solid var(--accent-amber)',
    }}>
      {initials}
    </div>
  );
};
