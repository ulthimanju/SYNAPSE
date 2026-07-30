import React, { useState } from 'react';
import { Button } from '../common/Button';
import { Search, Sparkles } from 'lucide-react';

export const QueryInput = ({ onSearch, loading = false }) => {
  const [query, setQuery] = useState('');
  const [topK, setTopK] = useState(5);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), topK);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a natural language search query to test vector similarity..."
          className="editorial-input"
          style={{ width: '100%', paddingLeft: '2.5rem' }}
        />
        <Search
          size={18}
          style={{
            position: 'absolute',
            left: '0.875rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }}
        />
      </div>

      <select
        value={topK}
        onChange={(e) => setTopK(Number(e.target.value))}
        className="editorial-input"
        style={{ width: '110px', fontSize: '0.875rem', cursor: 'pointer' }}
      >
        <option value={3}>Top 3</option>
        <option value={5}>Top 5</option>
        <option value={10}>Top 10</option>
      </select>

      <Button type="submit" disabled={!query.trim() || loading}>
        <Sparkles size={16} className={loading ? 'animate-spin' : ''} />
        <span>{loading ? 'Searching...' : 'Vector Search'}</span>
      </Button>
    </form>
  );
};
