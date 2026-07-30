import React from 'react';

export const Footer = () => {
  return (
    <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem 2rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
      &copy; {new Date().getFullYear()} Synapse Platform. All rights reserved.
    </footer>
  );
};
