import React, { useState } from 'react';
import { Flashcard } from './Flashcard';
import { FlashcardToolbar } from './FlashcardToolbar';
import { Card } from '../common/Card';
import { Layers } from 'lucide-react';

export const FlashcardDeck = ({ cards = [], onRegenerate, loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards || cards.length === 0) return null;

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFlip = () => {
    setFlipped((prev) => !prev);
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <span className="editorial-badge" style={{ marginBottom: '0.25rem' }}>SPACED REPETITION STUDY DECK</span>
        <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>Conceptual Study Flashcards</h2>
      </div>

      <Flashcard card={cards[currentIndex]} flipped={flipped} onFlip={handleFlip} />

      <FlashcardToolbar
        currentIndex={currentIndex}
        totalCards={cards.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onFlip={handleFlip}
        onRegenerate={onRegenerate}
        loading={loading}
      />
    </div>
  );
};
