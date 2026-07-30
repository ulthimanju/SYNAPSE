import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { OptionList } from './OptionList';
import { Target, Shield } from 'lucide-react';

export const QuestionCard = ({ question, selectedOption, onSelectOption, disabled = false }) => {
  if (!question) return null;

  return (
    <Card className="editorial-card" style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <Badge variant="outline">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Target size={12} style={{ color: 'var(--accent-amber)' }} />
            <span>{question.learning_objective || 'Learning Objective'}</span>
          </div>
        </Badge>

        <Badge variant="outline">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Shield size={12} />
            <span>{question.difficulty || 'Medium'}</span>
          </div>
        </Badge>
      </div>

      <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        {question.question}
      </h3>

      <OptionList
        options={question.options}
        selectedOption={selectedOption}
        onSelect={onSelectOption}
        disabled={disabled}
      />
    </Card>
  );
};
