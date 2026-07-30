import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { HelpCircle } from 'lucide-react';

export const QuizPlaceholder = () => {
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
        <HelpCircle size={28} />
      </div>

      <h3 className="font-serif" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
        Active-Recall Quiz & Assessment Generator
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.875rem' }}>
        Content not generated yet. Multiple-choice and conceptual evaluation quizzes will evaluate knowledge mastery across workspace topics.
      </p>

      <Button variant="outline" size="sm" disabled>
        Generate Evaluation Quiz
      </Button>
    </Card>
  );
};
