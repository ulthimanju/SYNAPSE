import React from 'react';

export const Spinner = ({ size = 'md' }) => {
  const dims = size === 'sm' ? '16px' : size === 'lg' ? '32px' : '24px';
  return (
    <div style={{
      width: dims,
      height: dims,
      border: '2px solid var(--border-color)',
      borderTopColor: 'var(--accent-amber)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  );
};
