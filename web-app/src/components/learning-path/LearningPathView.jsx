import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LearningUnitCard } from './LearningUnitCard';
import { BookOpen, RefreshCw, GitBranch, Compass, Layers } from 'lucide-react';

export const LearningPathView = ({ learningPath, onRegenerate, loading = false, workspaceId }) => {
  const [selectedPathId, setSelectedPathId] = useState('all');

  if (!learningPath) return null;

  const targetWsId = workspaceId || learningPath.workspace_id;
  const nodes = learningPath.knowledge_graph?.nodes || learningPath.units || [];
  const rolePaths = learningPath.learning_paths || [];

  // Filter nodes based on selected role learning path
  let activeNodes = nodes;
  if (selectedPathId !== 'all') {
    const selectedRole = rolePaths.find((p) => p.id === selectedPathId);
    if (selectedRole && selectedRole.node_sequence?.length > 0) {
      const seqSet = new Set(selectedRole.node_sequence);
      activeNodes = nodes.filter((n) => seqSet.has(n.id));
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span className="editorial-badge" style={{ marginBottom: '0.25rem' }}>HIERARCHICAL KNOWLEDGE GRAPH</span>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{learningPath.title}</h2>
          {learningPath.description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '750px' }}>
              {learningPath.description}
            </p>
          )}
        </div>

        {onRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Generating Graph...' : 'Regenerate Knowledge Graph'}</span>
          </Button>
        )}
      </div>

      {/* Role-Based Learning Path Filters */}
      {rolePaths.length > 0 && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={14} color="var(--accent-amber)" />
            <span>DERIVED ROLE LEARNING PATHS</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSelectedPathId('all')}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: '20px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                border: selectedPathId === 'all' ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                backgroundColor: selectedPathId === 'all' ? 'var(--accent-amber-light)' : 'transparent',
                color: selectedPathId === 'all' ? 'var(--accent-amber)' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              All Knowledge Nodes ({nodes.length})
            </button>

            {rolePaths.map((rp) => (
              <button
                key={rp.id}
                onClick={() => setSelectedPathId(rp.id)}
                style={{
                  padding: '0.4rem 0.875rem',
                  borderRadius: '20px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  border: selectedPathId === rp.id ? '1px solid var(--accent-amber)' : '1px solid var(--border-color)',
                  backgroundColor: selectedPathId === rp.id ? 'var(--accent-amber-light)' : 'transparent',
                  color: selectedPathId === rp.id ? 'var(--accent-amber)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                title={rp.description}
              >
                {rp.title} ({rp.node_sequence?.length || 0} nodes)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Nodes List / Knowledge Cards */}
      {activeNodes.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No knowledge nodes found for this filter.
        </div>
      ) : (
        <div>
          {activeNodes.map((unit, idx) => (
            <LearningUnitCard key={unit.id || idx} unit={unit} index={idx} workspaceId={targetWsId} />
          ))}
        </div>
      )}
    </div>
  );
};
