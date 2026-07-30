import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Send } from 'lucide-react';

export const ChatInput = ({ onSendMessage, loading = false }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onSendMessage(query.trim());
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask a question about this workspace..."
        className="editorial-input"
        style={{ flex: 1 }}
        disabled={loading}
      />
      <Button type="submit" disabled={!query.trim() || loading}>
        <Send size={16} className={loading ? 'animate-spin' : ''} />
        <span>{loading ? 'Thinking...' : 'Send'}</span>
      </Button>
    </form>
  );
};
