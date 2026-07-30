import React from 'react';

export const WelcomePanel = () => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
      <span className="editorial-badge" style={{ marginBottom: '1rem' }}>SYNAPSE IDENTITY</span>
      <h1 className="font-serif" style={{ fontSize: '2.25rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Welcome to Synapse
      </h1>
      <p style={{ fontSize: '0.9375rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        Sign in to access your neural workspaces, document embeddings, and real-time RAG intelligence engine.
      </p>
    </div>
  );
};
