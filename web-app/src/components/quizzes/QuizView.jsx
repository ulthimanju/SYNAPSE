import React, { useState } from 'react';
import { QuizProgress } from './QuizProgress';
import { QuestionCard } from './QuestionCard';
import { QuizResults } from './QuizResults';
import { Button } from '../common/Button';
import { ChevronLeft, ChevronRight, CheckCircle, RefreshCw } from 'lucide-react';

export const QuizView = ({ quiz, onRegenerate, loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  if (!quiz || !quiz.questions || quiz.questions.length === 0) return null;

  const questions = quiz.questions;
  const currentQuestion = questions[currentIndex];

  const handleSelectOption = (option) => {
    if (submitted) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <QuizResults
        questions={questions}
        answers={answers}
        onRetake={handleRetake}
        onRegenerate={onRegenerate}
        loading={loading}
      />
    );
  }

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <span className="editorial-badge" style={{ marginBottom: '0.25rem' }}>CONCEPT MASTERY ASSESSMENT</span>
          <h2 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>{quiz.title || 'Workspace Mastery Quiz'}</h2>
        </div>

        {onRegenerate && (
          <Button variant="outline" size="sm" onClick={onRegenerate} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>{loading ? 'Generating...' : 'Regenerate'}</span>
          </Button>
        )}
      </div>

      <QuizProgress currentIndex={currentIndex} totalQuestions={questions.length} />

      <QuestionCard
        question={currentQuestion}
        selectedOption={answers[currentQuestion.id]}
        onSelectOption={handleSelectOption}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <Button variant="outline" size="sm" onClick={handlePrev} disabled={currentIndex === 0}>
          <ChevronLeft size={16} /> Prev
        </Button>

        {currentIndex === questions.length - 1 ? (
          <Button onClick={handleSubmit} disabled={Object.keys(answers).length < questions.length}>
            <CheckCircle size={16} /> Submit Quiz
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Next <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
