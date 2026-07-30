import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { BookOpen, CheckCircle } from 'lucide-react';

export const LearningPathPlaceholder = ({ onGenerate }) => {
  return (
    <Card className="editorial-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-amber-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
        }}
      >
        <BookOpen size={28} />
      </div>

      <h3 className="font-serif" style={{ fontSize: '1.375rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        No Learning Path Generated Yet
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.875rem', lineHeight: 1.6 }}>
        Synthesize a textbook-grade hierarchical knowledge graph and role-based learning sequences directly from your workspace documents.
      </p>

      {onGenerate && (
        <Button onClick={onGenerate}>
          <BookOpen size={16} />
          <span>Generate Learning Path</span>
        </Button>
      )}
    </Card>
  );
};
