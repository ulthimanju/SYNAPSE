import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', padding: '1.5rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {children}
      </div>
    </div>
  );
};
