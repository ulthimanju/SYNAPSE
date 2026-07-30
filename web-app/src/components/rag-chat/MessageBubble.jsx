import React from 'react';
import { SourceList } from './SourceList';
import { Bot, User } from 'lucide-react';

export const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '1rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.75rem', maxWidth: '80%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: isUser ? 'var(--accent-amber)' : 'var(--accent-light)',
            color: isUser ? '#FFFFFF' : 'var(--accent-amber-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        <div
          style={{
            padding: '0.875rem 1.125rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isUser ? 'var(--accent-amber)' : 'var(--bg-card)',
            color: isUser ? '#FFFFFF' : 'var(--text-primary)',
            border: isUser ? 'none' : '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
            {message.content}
          </div>

          {!isUser && message.sources && message.sources.length > 0 && (
            <SourceList sources={message.sources} />
          )}
        </div>
      </div>
    </div>
  );
};
