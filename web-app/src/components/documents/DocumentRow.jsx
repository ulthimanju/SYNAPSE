import React, { useState } from 'react';
import { FileText, Trash2, Info, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Button } from '../common/Button';
import { DocumentDetailsDialog } from './DocumentDetailsDialog';
import { formatBytes, formatDate } from '../../utils/formatters';

export const DocumentRow = ({ document, onDelete, onRetry }) => {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry(document);
    } finally {
      setRetrying(false);
    }
  };

  const isFailed = document.status === 'failed';

  return (
    <>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--bg-card)',
          border: isFailed ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
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
              backgroundColor: isFailed ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isFailed ? '#ef4444' : 'var(--accent-amber)',
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {isFailed && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
              style={{
                borderColor: '#ef4444',
                color: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.05)',
              }}
              title="Restart Document Processing"
            >
              <RefreshCw size={14} className={retrying ? 'animate-spin' : ''} />
              <span>{retrying ? 'Retrying...' : 'Retry Processing'}</span>
            </Button>
          )}

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
