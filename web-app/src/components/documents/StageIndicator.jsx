import React from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';
import { Spinner } from '../common/Spinner';

export const StageIndicator = ({ title, state }) => {
  // state: 'completed' | 'active' | 'pending' | 'failed'
  const getIcon = () => {
    switch (state) {
      case 'completed':
        return <Check size={14} style={{ color: '#059669' }} />;
      case 'active':
        return <Spinner size="sm" />;
      case 'failed':
        return <AlertCircle size={14} style={{ color: '#DC2626' }} />;
      case 'pending':
      default:
        return <Clock size={14} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  const getBorderColor = () => {
    switch (state) {
      case 'completed':
        return '#10B981';
      case 'active':
        return 'var(--accent-amber)';
      case 'failed':
        return '#DC2626';
      case 'pending':
      default:
        return 'var(--border-color)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', flex: 1, minWidth: 0 }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          border: `2px solid ${getBorderColor()}`,
          backgroundColor: state === 'completed' ? '#D1FAE5' : state === 'active' ? 'var(--accent-light)' : 'var(--bg-card)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {getIcon()}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: state === 'active' ? 600 : 500, color: state === 'active' ? 'var(--accent-amber-hover)' : 'var(--text-secondary)' }}>
        {title}
      </span>
    </div>
  );
};
