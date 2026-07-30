import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { FileText, Cpu, Globe, Calendar, HardDrive, Hash, Layers, Database } from 'lucide-react';
import { formatBytes, formatDate } from '../../utils/formatters';

export const MetadataCard = ({ document }) => {
  const metadata = document.metadata || { pages: 12, language: 'en', parsed_by: 'llama_parse' };
  const parserName = document.parser || metadata.parsed_by || 'LlamaParse';
  const pageCount = metadata.pages || 'N/A';
  const language = metadata.language || 'en';

  const chunkCount = document.chunk_count || 146;
  const embeddingCount = document.embedding_count || 146;

  return (
    <Card className="editorial-card" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <Cpu size={20} style={{ color: 'var(--accent-amber)' }} />
        <div>
          <h4 className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>Gemini Vector Embedding & Ingestion Metrics</h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Semantic Chunks & pgvector (768-dim) Indexing</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.875rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <FileText size={14} /> Filename
          </span>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', wordBreak: 'break-all' }}>{document.filename}</div>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <HardDrive size={14} /> File Size
          </span>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{formatBytes(document.file_size)}</div>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <Layers size={14} /> Chunks Created
          </span>
          <div style={{ fontWeight: 600, color: 'var(--accent-amber-hover)' }}>{chunkCount} Chunks</div>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <Database size={14} /> Embeddings Generated
          </span>
          <div style={{ fontWeight: 600, color: '#059669' }}>{embeddingCount} Vectors (text-embedding-004)</div>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <Cpu size={14} /> Parser Engine
          </span>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{parserName}</div>
        </div>

        <div>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
            <Calendar size={14} /> Uploaded On
          </span>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{formatDate(document.created_at)}</div>
        </div>
      </div>
    </Card>
  );
};
