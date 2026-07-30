import React from 'react';
import { Badge } from '../common/Badge';
import { ProcessingIndicator } from './ProcessingIndicator';
import { CheckCircle2, AlertCircle, UploadCloud } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  switch (status) {
    case 'processing':
      return <ProcessingIndicator text="Processing..." />;
    case 'completed':
      return (
        <Badge variant="amber">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={12} />
            <span>Completed</span>
          </div>
        </Badge>
      );
    case 'failed':
      return (
        <Badge variant="outline" style={{ color: '#DC2626', borderColor: '#DC2626' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#DC2626' }}>
            <AlertCircle size={12} />
            <span>Failed</span>
          </div>
        </Badge>
      );
    case 'uploaded':
    default:
      return (
        <Badge variant="outline">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <UploadCloud size={12} />
            <span>Uploaded</span>
          </div>
        </Badge>
      );
  }
};
