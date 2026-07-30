import React from 'react';
import { SourceList } from './SourceList';
import { MarkdownRenderer } from '../common/MarkdownRenderer';
import { Bot, User, Sparkles } from 'lucide-react';

export const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '1.25rem',
      }}
    >
      <div style={{ display: 'flex', gap: '0.875rem', maxWidth: '85%', flexDirection: isUser ? 'row-reverse' : 'row' }}>
        {/* Avatar Badge */}
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: isUser ? 'var(--accent-amber)' : 'var(--bg-card)',
            color: isUser ? '#FFFFFF' : 'var(--accent-amber-hover)',
            border: isUser ? 'none' : '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          {isUser ? <User size={18} /> : <Sparkles size={18} />}
        </div>

        {/* Bubble Box */}
        <div
          style={{
            padding: isUser ? '0.875rem 1.25rem' : '1.25rem',
            borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
            backgroundColor: isUser ? 'var(--accent-amber)' : 'var(--bg-card)',
            color: isUser ? '#FFFFFF' : 'var(--text-primary)',
            border: isUser ? 'none' : '1px solid var(--border-color)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            width: '100%',
          }}
        >
          {isUser ? (
            <div style={{ fontSize: '0.9375rem', lineHeight: 1.6, whiteSpace: 'pre-line', fontWeight: 500 }}>
              {message.content}
            </div>
          ) : (
            <MarkdownRenderer content={message.content} />
          )}
        </div>
      </div>
    </div>
  );
};
