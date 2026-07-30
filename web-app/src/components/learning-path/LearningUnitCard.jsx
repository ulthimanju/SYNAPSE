import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DifficultyBadge } from './DifficultyBadge';
import { PrerequisiteList } from './PrerequisiteList';
import { ObjectiveList } from './ObjectiveList';
import { Clock, BookOpen, Code2, Award } from 'lucide-react';

export const LearningUnitCard = ({ unit, index, workspaceId }) => {
  const navigate = useNavigate();

  const handleOpenUnit = () => {
    navigate(`/workspaces/${workspaceId}/units/${unit.id}`);
  };

  const skillsGained = unit.skills_gained || [];
  const realWorldExamples = unit.real_world_examples || [];
  const practicalExercises = unit.practical_exercises || [];
  const dependsOn = unit.depends_on || unit.prerequisites || [];
  const nodeType = (unit.type || 'concept').toUpperCase();

  const getTypeBadgeStyle = (typeStr) => {
    switch (typeStr) {
      case 'DOMAIN':
        return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'MODULE':
        return { backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)' };
      case 'LESSON':
        return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)' };
      default: // CONCEPT
        return { backgroundColor: 'var(--accent-light)', color: 'var(--accent-amber-hover)', border: '1px solid var(--border-color)' };
    }
  };

  return (
    <Card className="editorial-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', borderLeft: nodeType === 'DOMAIN' ? '4px solid #3b82f6' : nodeType === 'MODULE' ? '4px solid #a855f7' : '4px solid var(--accent-amber)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.875rem',
            }}
          >
            {index + 1}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  ...getTypeBadgeStyle(nodeType),
                }}
              >
                {nodeType}
              </span>

              {unit.parent && (
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  parent: <strong style={{ color: 'var(--text-secondary)' }}>{unit.parent}</strong>
                </span>
              )}
            </div>

            <h3 className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{unit.title}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
              <Clock size={12} /> {unit.estimated_time || '30 min'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <DifficultyBadge difficulty={unit.difficulty} />
          <Button variant="primary" size="sm" onClick={handleOpenUnit}>
            <BookOpen size={14} />
            <span>Open Unit</span>
          </Button>
        </div>
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
        {unit.description}
      </p>

      {/* Objectives & Dependencies */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
        <ObjectiveList objectives={unit.learning_objectives} />
        <PrerequisiteList prerequisites={dependsOn} />
      </div>

      {/* Skills & Exercises Pills */}
      {(skillsGained.length > 0 || practicalExercises.length > 0 || realWorldExamples.length > 0) && (
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {skillsGained.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Award size={13} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>SKILLS:</span>
              {skillsGained.map((sk, sIdx) => (
                <span key={sIdx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                  {sk}
                </span>
              ))}
            </div>
          )}

          {practicalExercises.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Code2 size={13} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>PRACTICAL EXERCISES:</span>
              {practicalExercises.map((ex, eIdx) => (
                <span key={eIdx} style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  • {ex}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
