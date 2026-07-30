import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Card } from '../common/Card';
import { MessageSquare } from 'lucide-react';

export const MessageList = ({ messages = [] }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <Card className="editorial-card" style={{ padding: '3rem 2rem', textAlign: 'center', margin: '1rem 0' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-amber-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
          }}
        >
          <MessageSquare size={24} />
        </div>
        <h4 className="font-serif" style={{ fontSize: '1.125rem', marginBottom: '0.375rem' }}>
          Singleton Workspace RAG Assistant
        </h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '420px', margin: '0 auto' }}>
          Ask any question about this workspace. Answers are generated using Gemini 2.5 Flash grounded in 768-dim vector embeddings with exact citations.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem 0' }}>
      {messages.map((msg, idx) => (
        <MessageBubble key={msg.id || idx} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
};
