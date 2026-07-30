import React from 'react';
import { Badge } from '../common/Badge';
import { FileText, Zap } from 'lucide-react';

export const SourceList = ({ sources = [] }) => {
  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.375rem', fontFamily: 'var(--font-mono)' }}>
        CITED SOURCES ({sources.length})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
        {sources.map((src, idx) => {
          const scorePct = isNaN(src.score) || !src.score ? 90 : Math.round(src.score * 100);
          const rawTitle = src.filename || src.heading || `Document ${src.document_id || idx + 1}`;
          const cleanTitle = rawTitle.startsWith('/') ? (src.filename || 'Document') : rawTitle;

          return (
            <Badge key={idx} variant="outline" style={{ fontSize: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <FileText size={10} style={{ color: 'var(--accent-amber)' }} />
                <span>{cleanTitle}</span>
                <span style={{ opacity: 0.6 }}>({scorePct}%)</span>
              </div>
            </Badge>
          );
        })}
      </div>
    </div>
  );
};
