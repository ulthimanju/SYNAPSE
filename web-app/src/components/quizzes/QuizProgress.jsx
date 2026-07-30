import React from 'react';

export const QuizProgress = ({ currentIndex, totalQuestions }) => {
  const percentage = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          QUESTION {currentIndex + 1} OF {totalQuestions}
        </span>
        <span style={{ fontWeight: 600, color: 'var(--accent-amber-hover)', fontFamily: 'var(--font-mono)' }}>
          {percentage}% COMPLETED
        </span>
      </div>
      <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--accent-amber)',
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
};
