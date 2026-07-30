import React from 'react';
import { Card } from '../common/Card';
import { DifficultyChip } from './DifficultyChip';
import { TagList } from './TagList';
import { RotateCw, HelpCircle, CheckCircle2 } from 'lucide-react';

export const Flashcard = ({ card, flipped, onFlip }) => {
  if (!card) return null;

  return (
    <div
      onClick={onFlip}
      style={{
        perspective: '1000px',
        cursor: 'pointer',
        minHeight: '280px',
        userSelect: 'none',
      }}
    >
      <Card
        className="editorial-card"
        style={{
          minHeight: '280px',
          padding: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'transform 0.4s ease, box-shadow 0.2s ease',
          backgroundColor: flipped ? 'var(--accent-light)' : 'var(--bg-card)',
          border: flipped ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {flipped ? (
              <CheckCircle2 size={20} style={{ color: '#10B981' }} />
            ) : (
              <HelpCircle size={20} style={{ color: 'var(--accent-amber)' }} />
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
              {flipped ? 'ANSWER' : 'QUESTION'}
            </span>
          </div>

          <DifficultyChip difficulty={card.difficulty} />
        </div>

        <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
          <p
            className="font-serif"
            style={{
              fontSize: flipped ? '1.125rem' : '1.25rem',
              color: 'var(--text-primary)',
              lineHeight: 1.6,
            }}
          >
            {flipped ? card.answer : card.question}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
          <TagList tags={card.tags} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <RotateCw size={12} />
            <span>Click to {flipped ? 'see question' : 'reveal answer'}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
