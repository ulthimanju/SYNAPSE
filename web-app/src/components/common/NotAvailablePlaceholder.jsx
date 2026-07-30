import React from 'react';
import { Card } from './Card';
import { Lock } from 'lucide-react';

export const NotAvailablePlaceholder = ({ title = "Not yet Available", description = "The workspace owner has not generated this content yet." }) => {
  return (
    <Card style={{ padding: '3.5rem 1.5rem', textAlign: 'center', maxWidth: '560px', margin: '1.5rem auto' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--accent-amber-hover)',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
        }}
      >
        <Lock size={26} />
      </div>
      <h3 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.625rem' }}>
        {title}
      </h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
        {description}
      </p>
    </Card>
  );
};
