import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ExplanationPanel } from './ExplanationPanel';
import { Award, RotateCcw, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';

export const QuizResults = ({ questions = [], answers = {}, onRetake, onRegenerate, loading = false }) => {
  let score = 0;
  questions.forEach((q) => {
    if (answers[q.id] === q.correct_answer) {
      score += 1;
    }
  });

  const percentage = Math.round((score / questions.length) * 100);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <Card className="editorial-card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: percentage >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'var(--accent-light)',
            color: percentage >= 70 ? '#10B981' : 'var(--accent-amber-hover)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
          }}
        >
          <Award size={32} />
        </div>

        <h2 className="font-serif" style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
          Assessment Complete!
        </h2>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0.5rem 0', fontFamily: 'var(--font-mono)' }}>
          {percentage}%
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          You answered {score} out of {questions.length} questions correctly.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <Button variant="secondary" onClick={onRetake}>
            <RotateCcw size={16} /> Retake Quiz
          </Button>
          {onRegenerate && (
            <Button variant="outline" onClick={onRegenerate} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Generating New Quiz...' : 'Regenerate Quiz'}</span>
            </Button>
          )}
        </div>
      </Card>

      <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
        Detailed Answer Review
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {questions.map((q, idx) => {
          const userAns = answers[q.id];
          const isCorrect = userAns === q.correct_answer;
          return (
            <Card key={q.id || idx} className="editorial-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                {isCorrect ? (
                  <CheckCircle2 size={20} style={{ color: '#10B981', flexShrink: 0, marginTop: '0.125rem' }} />
                ) : (
                  <XCircle size={20} style={{ color: '#EF4444', flexShrink: 0, marginTop: '0.125rem' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                    {idx + 1}. {q.question}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Your Answer: <strong style={{ color: isCorrect ? '#10B981' : '#EF4444' }}>{userAns || 'No answer selected'}</strong>
                  </div>
                  {!isCorrect && (
                    <div style={{ fontSize: '0.875rem', color: '#10B981', marginTop: '0.25rem' }}>
                      Correct Answer: <strong>{q.correct_answer}</strong>
                    </div>
                  )}
                  <ExplanationPanel explanation={q.explanation} isCorrect={isCorrect} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
