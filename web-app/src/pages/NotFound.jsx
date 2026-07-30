import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { Button } from '../components/common/Button';

export const NotFound = () => {
  return (
    <PublicLayout>
      <div style={{ textStyle: 'center', padding: '4rem 1rem', maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="font-serif" style={{ fontSize: '5rem', color: 'var(--accent-amber)' }}>404</h1>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The requested page could not be located within the Synapse platform directory.
        </p>
        <Link to="/"><Button>Return to Home</Button></Link>
      </div>
    </PublicLayout>
  );
};
