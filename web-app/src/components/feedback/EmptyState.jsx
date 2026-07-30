import React from 'react';
import { Button } from '../common/Button';

export const EmptyState = ({ title = 'No Data Available', description = 'There are no items to display right now.', actionText, onAction }) => {
  return (
    <div className="editorial-card" style={{ textStyle: 'center', padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <h3 className="font-serif" style={{ fontSize: '1.25rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '400px', textAlign: 'center' }}>{description}</p>
      {actionText && <Button onClick={onAction}>{actionText}</Button>}
    </div>
  );
};
