import React from 'react';

export const Skeleton = ({ width = '100%', height = '20px', className = '' }) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        animation: 'pulse 1.5s infinite ease-in-out',
      }}
    />
  );
};
