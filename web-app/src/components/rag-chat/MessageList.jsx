import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';
import { Card } from '../common/Card';
import { Sparkles, ArrowUpRight, HelpCircle } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "Summarize the core architectural design and service boundaries in this workspace.",
  "What are the primary technical concepts and takeaways from the uploaded documents?",
  "Explain how data flows between services in this domain architecture.",
];

export const MessageList = ({ messages = [], onSelectPrompt }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center', maxWidth: '640px', margin: '0 auto' }}>
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--accent-light)',
            color: 'var(--accent-amber-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem auto',
            border: '1px solid var(--border-color)',
          }}
        >
          <Sparkles size={28} />
        </div>
        <h3 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Workspace AI Research Assistant
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Ask questions grounded directly in your uploaded workspace documents. Responses are synthesized via Google Gemini RAG with exact vector citations.
        </p>

        {/* Suggested Prompts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.25rem' }}>
            SUGGESTED EXPLORATIONS
          </div>
          {SUGGESTED_PROMPTS.map((promptText, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPrompt && onSelectPrompt(promptText)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1.125rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-amber)';
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.backgroundColor = 'var(--bg-card)';
              }}
            >
              <span>{promptText}</span>
              <ArrowUpRight size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0, marginLeft: '0.5rem' }} />
            </button>
          ))}
        </div>
      </div>
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
