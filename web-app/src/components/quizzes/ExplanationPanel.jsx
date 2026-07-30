import React from 'react';
import { Card } from '../common/Card';
import { Lightbulb } from 'lucide-react';

export const ExplanationPanel = ({ explanation, isCorrect }) => {
  if (!explanation) return null;

  return (
    <Card
      style={{
        padding: '1rem 1.25rem',
        marginTop: '1rem',
        backgroundColor: isCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
        borderLeft: `4px solid ${isCorrect ? '#10B981' : '#EF4444'}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <Lightbulb size={18} style={{ color: isCorrect ? '#10B981' : '#EF4444', marginTop: '0.125rem', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: isCorrect ? '#065F46' : '#991B1B' }}>
            {isCorrect ? 'Correct Explanation' : 'Explanation & Context'}
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {explanation}
          </p>
        </div>
      </div>
    </Card>
  );
};
