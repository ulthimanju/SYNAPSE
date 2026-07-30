import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../common/Button';
import { Send, Loader2, Sparkles } from 'lucide-react';

export const ChatInput = ({ onSendMessage, loading = false }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [query]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim() && !loading) {
      onSendMessage(query.trim());
      setQuery('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '14px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
        marginTop: '0.75rem',
      }}
    >
      <textarea
        ref={textareaRef}
        rows={1}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask anything about your workspace documents (Enter to send, Shift+Enter for new line)..."
        disabled={loading}
        style={{
          flex: 1,
          border: 'none',
          outline: 'none',
          backgroundColor: 'transparent',
          color: 'var(--text-primary)',
          fontSize: '0.9375rem',
          fontFamily: 'inherit',
          lineHeight: 1.5,
          resize: 'none',
          maxHeight: '140px',
        }}
      />

      <Button
        type="submit"
        disabled={!query.trim() || loading}
        style={{
          borderRadius: '10px',
          padding: '0.625rem 1.125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          flexShrink: 0,
        }}
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        <span>{loading ? 'Analyzing...' : 'Send'}</span>
      </Button>
    </form>
  );
};
