import React from 'react';
import { DocumentRow } from './DocumentRow';
import { EmptyState } from '../feedback/EmptyState';

export const DocumentList = ({ documents = [], onDelete, onRetry }) => {
  if (!documents || documents.length === 0) {
    return (
      <EmptyState
        title="No Documents Uploaded"
        description="Upload research papers, PDFs, or text documents to populate this workspace."
      />
    );
  }

  return (
    <div>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)' }}>
        WORKSPACE DOCUMENTS ({documents.length})
      </div>
      {documents.map((doc) => (
        <DocumentRow key={doc.id} document={doc} onDelete={onDelete} onRetry={onRetry} />
      ))}
    </div>
  );
};
