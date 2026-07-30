import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { LearningUnitCard } from './LearningUnitCard';
import { BookOpen, RefreshCw } from 'lucide-react';

export const LearningPathView = ({ learningPath, onRegenerate, loading = false, workspaceId }) => {
  if (!learningPath || !learningPath.units || learningPath.units.length === 0) return null;

  const targetWsId = workspaceId || learningPath.workspace_id;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span className="editorial-badge" style={{ marginBottom: '0.25rem' }}>PEDAGOGICAL ROADMAP</span>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{learningPath.title}</h2>
        </div>

        {onRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Generating Path...' : 'Regenerate Path'}</span>
          </Button>
        )}
      </div>

      <div>
        {learningPath.units.map((unit, idx) => (
          <LearningUnitCard key={unit.id || idx} unit={unit} index={idx} workspaceId={targetWsId} />
        ))}
      </div>
    </div>
  );
};
