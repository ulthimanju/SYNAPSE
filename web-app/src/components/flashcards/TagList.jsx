import React from 'react';
import { Badge } from '../common/Badge';
import { Tag } from 'lucide-react';

export const TagList = ({ tags = [] }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
      {tags.map((tag, idx) => (
        <Badge key={idx} variant="outline" style={{ fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Tag size={10} style={{ color: 'var(--accent-amber)' }} />
            <span>{tag}</span>
          </div>
        </Badge>
      ))}
    </div>
  );
};
