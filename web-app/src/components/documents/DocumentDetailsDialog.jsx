import React from 'react';
import { Dialog } from '../common/Dialog';
import { MetadataCard } from './MetadataCard';
import { ProcessingTimeline } from './ProcessingTimeline';
import { Button } from '../common/Button';

export const DocumentDetailsDialog = ({ isOpen, onClose, document }) => {
  if (!document) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Document Ingestion & Embedding Pipeline">
      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <ProcessingTimeline status={document.status} processingStage={document.processing_stage} />

        <MetadataCard document={document} />

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Dialog>
  );
};
