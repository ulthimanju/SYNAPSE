import React from 'react';
import { Badge } from '../common/Badge';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export const JobStatusBadge = ({ status = 'QUEUED' }) => {
  const getBadgeConfig = () => {
    switch (status.toUpperCase()) {
      case 'RUNNING':
        return { variant: 'amber', icon: Loader2, className: 'animate-spin', text: 'Processing' };
      case 'COMPLETED':
        return { variant: 'amber', icon: CheckCircle2, className: '', text: 'Completed' };
      case 'FAILED':
        return { variant: 'outline', icon: XCircle, className: '', text: 'Failed' };
      case 'QUEUED':
      default:
        return { variant: 'outline', icon: Clock, className: '', text: 'Queued' };
    }
  };

  const { variant, icon: Icon, className, text } = getBadgeConfig();

  return (
    <Badge variant={variant}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Icon size={12} className={className} />
        <span>{text}</span>
      </div>
    </Badge>
  );
};
