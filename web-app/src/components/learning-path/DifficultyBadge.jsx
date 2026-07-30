import React from 'react';
import { Badge } from '../common/Badge';
import { Shield } from 'lucide-react';

export const DifficultyBadge = ({ difficulty = 'Beginner' }) => {
  const getVariant = () => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'amber';
      case 'advanced':
        return 'amber';
      case 'intermediate':
      default:
        return 'outline';
    }
  };

  return (
    <Badge variant={getVariant()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Shield size={12} />
        <span>{difficulty}</span>
      </div>
    </Badge>
  );
};
