import React from 'react';
import { Badge } from '../common/Badge';
import { Shield } from 'lucide-react';

export const DifficultyChip = ({ difficulty = 'Medium' }) => {
  const getVariant = () => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'amber';
      case 'hard':
        return 'amber';
      case 'medium':
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
