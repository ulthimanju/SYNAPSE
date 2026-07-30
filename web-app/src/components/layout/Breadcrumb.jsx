import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split('/').filter(Boolean);

  return (
    <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
      <Link to="/" style={{ color: 'var(--text-muted)' }}>app</Link>
      {segments.map((seg, idx) => (
        <React.Fragment key={idx}>
          <span>/</span>
          <span style={{ color: idx === segments.length - 1 ? 'var(--text-primary)' : 'var(--text-muted)' }}>{seg}</span>
        </React.Fragment>
      ))}
    </nav>
  );
};
