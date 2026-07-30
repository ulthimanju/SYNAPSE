import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Layers } from 'lucide-react';

export const FlashcardsPlaceholder = () => {
  return (
    <Card className="editorial-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--accent-amber)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
        }}
      >
        <Layers size={28} />
      </div>

      <h3 className="font-serif" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
        Interactive Spaced-Repetition Flashcards
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.875rem' }}>
        Content not generated yet. Key concepts, formulas, and terminology flashcards will be extracted directly from your document chunks.
      </p>

      <Button variant="outline" size="sm" disabled>
        Extract Concept Flashcards
      </Button>
    </Card>
  );
};
