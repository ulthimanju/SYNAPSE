import React from 'react';
import { Card } from '../common/Card';
import { Clock } from 'lucide-react';

export const StudyTimeCard = ({ studyTime = '6 hours' }) => {
  return (
    <Card className="editorial-card" style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-amber-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Clock size={18} />
      </div>
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>ESTIMATED STUDY TIME</div>
        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>{studyTime}</div>
      </div>
    </Card>
  );
};
