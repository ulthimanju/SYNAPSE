import React from 'react';
import { Card } from '../common/Card';
import { DifficultyBadge } from './DifficultyBadge';
import { PrerequisiteList } from './PrerequisiteList';
import { ObjectiveList } from './ObjectiveList';
import { Clock, BookOpen } from 'lucide-react';

export const LearningUnitCard = ({ unit, index }) => {
  return (
    <Card className="editorial-card" style={{ padding: '1.5rem', marginBottom: '1.25rem', borderLeft: '4px solid var(--accent-amber)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent-amber-hover)',
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
            <h3 className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>{unit.title}</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} /> {unit.estimated_time}
            </span>
          </div>
        </div>

        <DifficultyBadge difficulty={unit.difficulty} />
      </div>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
        {unit.description}
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <ObjectiveList objectives={unit.learning_objectives} />
        <PrerequisiteList prerequisites={unit.prerequisites} />
      </div>
    </Card>
  );
};
