import React from 'react';
import { Badge } from '../common/Badge';
import { ArrowLeftRight } from 'lucide-react';

export const PrerequisiteList = ({ prerequisites = [] }) => {
  if (!prerequisites || prerequisites.length === 0) return null;

  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem', fontFamily: 'var(--font-mono)' }}>
        PREREQUISITES
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {prerequisites.map((req, idx) => (
          <Badge key={idx} variant="outline" style={{ fontSize: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ArrowLeftRight size={10} style={{ color: 'var(--accent-amber)' }} />
              <span>{req}</span>
            </div>
          </Badge>
        ))}
      </div>
    </div>
  );
};
