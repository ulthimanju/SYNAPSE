import React from 'react';
import { Button } from '../common/Button';
import { ChevronLeft, ChevronRight, RefreshCw, RotateCw } from 'lucide-react';

export const FlashcardToolbar = ({
  currentIndex,
  totalCards,
  onPrev,
  onNext,
  onFlip,
  onRegenerate,
  loading = false,
}) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Button variant="outline" size="sm" onClick={onPrev} disabled={currentIndex === 0 || loading}>
          <ChevronLeft size={16} /> Prev
        </Button>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', padding: '0 0.5rem', fontFamily: 'var(--font-mono)' }}>
          {currentIndex + 1} / {totalCards}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={currentIndex === totalCards - 1 || loading}>
          Next <ChevronRight size={16} />
        </Button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Button variant="secondary" size="sm" onClick={onFlip}>
          <RotateCw size={14} /> Flip Card
        </Button>
        {onRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Generating Deck...' : 'Regenerate Deck'}</span>
          </Button>
        )}
      </div>
    </div>
  );
};
