import React, { useState } from 'react';
import { FileText, Trash2, Info } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../common/Button';
import { DocumentDetailsDialog } from './DocumentDetailsDialog';
import { formatBytes, formatDate } from '../../utils/formatters';

export const DocumentRow = ({ document, onDelete }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-amber)',
            }}
          >
            <FileText size={20} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {document.filename}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {formatBytes(document.file_size)} • Uploaded {formatDate(document.created_at)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <StatusBadge status={document.status} />
          <Button variant="ghost" size="sm" onClick={() => setDetailsOpen(true)} title="View Metadata">
            <Info size={16} />
          </Button>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(document.id)} style={{ color: '#DC2626' }}>
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      </div>

      <DocumentDetailsDialog
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        document={document}
      />
    </>
  );
};
