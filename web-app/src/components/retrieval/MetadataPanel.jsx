import React from 'react';
import { Badge } from '../common/Badge';
import { Layers } from 'lucide-react';

export const MetadataPanel = ({ metadata = {} }) => {
  const heading = metadata.heading || 'Document Section';
  const sectionPath = metadata.section_path || heading;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
      <Badge variant="outline" style={{ fontSize: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Layers size={10} style={{ color: 'var(--accent-amber)' }} />
          <span>{sectionPath}</span>
        </div>
      </Badge>
    </div>
  );
};
