import React from 'react';
import { Card } from '../common/Card';
import { SimilarityBadge } from './SimilarityBadge';
import { MetadataPanel } from './MetadataPanel';

export const RetrievedChunkCard = ({ result, rank }) => {
  if (!result) return null;

  return (
    <Card className="editorial-card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-amber-hover)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8125rem',
            }}
          >
            #{rank}
          </div>
          <MetadataPanel metadata={result.metadata} />
        </div>

        <SimilarityBadge score={result.score} />
      </div>

      <div
        style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          backgroundColor: 'var(--bg-secondary)',
          padding: '1rem',
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'pre-line',
        }}
      >
        {result.content}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span>Chunk ID: {result.chunk_id}</span>
        <span>Document ID: {result.document_id}</span>
      </div>
    </Card>
  );
};
