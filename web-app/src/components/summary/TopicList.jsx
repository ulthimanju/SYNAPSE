import React from 'react';
import { Badge } from '../common/Badge';
import { Tag } from 'lucide-react';

export const TopicList = ({ topics = [] }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
        KEY TOPICS & THEMATIC DOMAINS
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {topics.map((topic, idx) => (
          <Badge key={idx} variant="outline" style={{ padding: '0.375rem 0.625rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Tag size={12} style={{ color: 'var(--accent-amber)' }} />
              <span>{topic}</span>
            </div>
          </Badge>
        ))}
      </div>
    </div>
  );
};
