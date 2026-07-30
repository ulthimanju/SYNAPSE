import React from 'react';

export const Card = ({ children, title, subtitle, className = '', ...props }) => {
  return (
    <div className={`editorial-card ${className}`} {...props}>
      {title && (
        <div style={{ marginBottom: '1rem' }}>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{title}</h3>
          {subtitle && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
