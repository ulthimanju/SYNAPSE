import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const ObjectiveList = ({ objectives = [] }) => {
  if (!objectives || objectives.length === 0) return null;

  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem', fontFamily: 'var(--font-mono)' }}>
        LEARNING OBJECTIVES
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {objectives.map((obj, idx) => (
          <li key={idx} style={{ fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={14} style={{ color: '#10B981', flexShrink: 0 }} />
            <span>{obj}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
