import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Sparkles, FileText, AlertCircle } from 'lucide-react';

export const WorkspaceSummaryPlaceholder = () => {
  return (
    <Card className="editorial-card" style={{ padding: '2rem', textAlign: 'center' }}>
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
        <Sparkles size={28} />
      </div>

      <h3 className="font-serif" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
        Workspace AI Synthesis & Executive Summary
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.875rem' }}>
        Content not generated yet. The AI Service will automatically synthesize multi-document knowledge graphs into executive summaries once enabled.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
        <Button variant="outline" size="sm" disabled>
          <Sparkles size={16} /> Generate Executive Summary
        </Button>
      </div>
    </Card>
  );
};
