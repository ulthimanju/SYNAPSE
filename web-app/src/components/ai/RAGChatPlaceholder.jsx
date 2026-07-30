import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { MessageSquare, Send } from 'lucide-react';

export const RAGChatPlaceholder = () => {
  return (
    <Card className="editorial-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--accent-light)',
          color: 'var(--accent-amber-hover)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem auto',
        }}
      >
        <MessageSquare size={28} />
      </div>

      <h3 className="font-serif" style={{ fontSize: '1.375rem', marginBottom: '0.5rem' }}>
        RAG Vector Assistant & Document Q&A
      </h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 1.5rem auto', fontSize: '0.875rem' }}>
        Content not generated yet. RAG vector retrieval will allow you to query your indexed 768-dim embeddings with exact citations.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', maxWidth: '500px', margin: '0 auto' }}>
        <input
          type="text"
          disabled
          placeholder="Ask a question about this workspace..."
          className="editorial-input"
          style={{ flex: 1 }}
        />
        <Button disabled>
          <Send size={16} />
        </Button>
      </div>
    </Card>
  );
};
