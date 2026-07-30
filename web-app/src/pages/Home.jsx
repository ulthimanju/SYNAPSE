import React from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <PublicLayout>
      <div style={{ maxWidth: '800px', margin: '3rem auto', textAlign: 'center' }}>
        <span className="editorial-badge" style={{ marginBottom: '1rem' }}>SYNAPSE PLATFORM</span>
        <h1 style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>Intelligent Neural Workspace & RAG Engine</h1>
        <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Connect your workspace documents, parse knowledge graphs, and query intelligence in real-time.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/workspaces"><Button size="lg">Explore Workspaces</Button></Link>
          <Link to="/login"><Button variant="secondary" size="lg">Sign In</Button></Link>
        </div>
      </div>
    </PublicLayout>
  );
};
