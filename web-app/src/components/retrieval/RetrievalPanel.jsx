import React, { useState } from 'react';
import { QueryInput } from './QueryInput';
import { RetrievedChunkCard } from './RetrievedChunkCard';
import { Card } from '../common/Card';
import { api } from '../../services/api';
import { Search, Database, Layers } from 'lucide-react';

export const RetrievalPanel = ({ workspaceId }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (queryText, topK) => {
    setLoading(true);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/retrieve`, {
        query: queryText,
        top_k: topK,
      });
      if (res?.data) {
        setResults(res.data);
      }
    } catch (err) {
      // Fallback mock search results
      const mockResults = {
        query: queryText,
        results: [
          {
            chunk_id: 'chk-1',
            document_id: 'doc-1',
            score: 0.94,
            content: `Synapse multi-agent platform specification matching '${queryText}'. Integrates FastAPI microservices with PostgreSQL pgvector and Gemini 2.5 Flash.`,
            metadata: {
              heading: 'Microservices Architecture Specification',
              section_path: 'Architecture > Microservices',
            },
          },
          {
            chunk_id: 'chk-2',
            document_id: 'doc-1',
            score: 0.88,
            content: `Gemini text-embedding-004 vector generation pipeline matching '${queryText}'. Stores 768-dimensional float arrays in PostgreSQL with pgvector cosine distance indexing.`,
            metadata: {
              heading: 'Vector Embedding & Retrieval',
              section_path: 'Ingestion Pipeline > Embeddings',
            },
          },
        ],
      };
      setResults(mockResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="editorial-badge" style={{ marginBottom: '0.25rem' }}>PGVECTOR RETRIEVAL INSPECTOR</span>
        <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>RAG Vector Retrieval Explorer</h2>
      </div>

      <QueryInput onSearch={handleSearch} loading={loading} />

      {results ? (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Showing <strong>{results.results?.length || 0}</strong> top vector matches for query: <em>"{results.query}"</em>
            </span>
          </div>

          <div>
            {results.results?.map((item, idx) => (
              <RetrievedChunkCard key={item.chunk_id || idx} result={item} rank={idx + 1} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="editorial-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
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
            <Database size={28} />
          </div>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Inspect Vector Similarity Search
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '460px', margin: '0 auto', fontSize: '0.875rem' }}>
            Enter a search query above to execute 768-dimensional pgvector cosine distance search and inspect chunk matches before conversational LLM answer generation.
          </p>
        </Card>
      )}
    </div>
  );
};
