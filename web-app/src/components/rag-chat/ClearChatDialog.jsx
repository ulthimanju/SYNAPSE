import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle } from 'lucide-react';

export const ClearChatDialog = ({ isOpen, onClose, onConfirm, loading = false }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <Card className="editorial-card" style={{ maxWidth: '420px', width: '100%', padding: '1.5rem', textAlign: 'center' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#EF4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
          Clear Workspace Chat History?
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          This will permanently delete all messages in this conversation. The workspace chat document will remain ready for new questions.
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            size="sm"
            style={{ backgroundColor: '#EF4444', borderColor: '#EF4444', color: '#FFFFFF' }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Clearing...' : 'Clear History'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
