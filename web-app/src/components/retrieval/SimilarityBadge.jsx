import React from 'react';
import { Badge } from '../common/Badge';
import { Zap } from 'lucide-react';

export const SimilarityBadge = ({ score = 0.9 }) => {
  const percentage = Math.round(score * 100);
  const getVariant = () => {
    if (score >= 0.85) return 'amber';
    if (score >= 0.7) return 'outline';
    return 'outline';
  };

  return (
    <Badge variant={getVariant()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Zap size={12} style={{ color: 'var(--accent-amber-hover)' }} />
        <span>{percentage}% Match ({score})</span>
      </div>
    </Badge>
  );
};
