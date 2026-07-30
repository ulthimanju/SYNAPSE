import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Alert } from '../components/feedback/Alert';
import { api } from '../services/api';
import {
  ArrowLeft,
  BookOpen,
  Layers,
  HelpCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Award,
  Clock,
  FileText
} from 'lucide-react';

export const LearningUnitDetail = () => {
  const { workspaceId, unitId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [unitContent, setUnitContent] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'flashcards' | 'quiz'

  // Flashcards state
  const [currentCardIdx, setCurrentCardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());

  // Quiz state
  const [userAnswers, setUserAnswers] = useState({}); // { [qIdx]: selectedOption }
  const [submittedQuiz, setSubmittedQuiz] = useState(false);

  const fetchUnitContent = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/units/${unitId}`, { timeout: 0 });
      const data = res?.data || res;
      if (data) {
        setUnitContent(data);
      } else {
        setErrorMsg('Failed to load unit content.');
      }
    } catch (err) {
      console.error('Error loading unit content:', err);
      const msg = err?.error?.message || err?.message || 'Failed to fetch unit content. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (workspaceId && unitId) {
      fetchUnitContent();
    }
  }, [workspaceId, unitId]);

  const handleSelectQuizOption = (qIdx, option) => {
    if (submittedQuiz) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: option }));
  };

  const handleResetQuiz = () => {
    setUserAnswers({});
    setSubmittedQuiz(false);
  };

  const toggleCardKnown = (idx) => {
    setKnownCards((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const flashcards = unitContent?.flashcards || [];
  const quizQuestions = unitContent?.quiz?.questions || [];
  const unitTitle = unitContent?.unit_title || `Unit ${unitId}`;

  // Score calculation for Quiz
  const calculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, i) => {
      if (userAnswers[i] === q.correct_answer) score++;
    });
    return score;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      {/* Topbar Navigation Header (No Sidebar Layout) */}
      <header
        style={{
          height: '60px',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-color)',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate(`/workspaces/${workspaceId}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          title="Back to Workspace Learning Path"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <div style={{ height: '20px', width: '1px', backgroundColor: 'var(--border-color)' }} />

        {/* Unit Title */}
        <h2 className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--text-primary)', margin: 0, fontWeight: 600 }}>
          {unitTitle}
        </h2>
      </header>

      {/* Main Page Container */}
      <main style={{ flex: 1, width: '100%', maxWidth: '1080px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Loading State */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 1rem', gap: '1.25rem', textAlign: 'center' }}>
            <RefreshCw size={36} className="animate-spin" style={{ color: 'var(--accent-amber)' }} />
            <div>
              <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Loading Learning Unit Content...
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Synthesizing Unit Summary, Extracting Flashcards & Generating Quiz via AI Engine...
              </p>
            </div>
          </div>
        ) : errorMsg ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
            <Alert type="info" message={errorMsg} />
            <Button onClick={fetchUnitContent} style={{ width: 'fit-content' }}>
              <RefreshCw size={14} />
              <span>Retry Loading Unit</span>
            </Button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Tab-based Navigation Bar */}
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem',
              }}
            >
              <button
                onClick={() => setActiveTab('summary')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'summary' ? 600 : 500,
                  color: activeTab === 'summary' ? 'var(--accent-amber-hover)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === 'summary' ? 'var(--accent-light)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <FileText size={16} />
                <span>Unit Summary</span>
              </button>

              <button
                onClick={() => setActiveTab('flashcards')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'flashcards' ? 600 : 500,
                  color: activeTab === 'flashcards' ? 'var(--accent-amber-hover)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === 'flashcards' ? 'var(--accent-light)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Layers size={16} />
                <span>Flashcards ({flashcards.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1.25rem',
                  fontSize: '0.875rem',
                  fontWeight: activeTab === 'quiz' ? 600 : 500,
                  color: activeTab === 'quiz' ? 'var(--accent-amber-hover)' : 'var(--text-secondary)',
                  backgroundColor: activeTab === 'quiz' ? 'var(--accent-light)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <HelpCircle size={16} />
                <span>Quiz ({quizQuestions.length})</span>
              </button>
            </div>

            {/* TAB CONTENT: SUMMARY */}
            {activeTab === 'summary' && (
              <Card style={{ padding: '2rem' }}>
                <h2 className="font-serif" style={{ fontSize: '1.35rem', color: 'var(--text-primary)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  Executive Unit Summary & Analysis
                </h2>
                <div style={{ lineHeight: 1.8, fontSize: '0.95rem', color: 'var(--text-secondary)', whiteSpace: 'pre-line' }}>
                  {unitContent?.unit_summary || 'No summary text available.'}
                </div>
              </Card>
            )}

            {/* TAB CONTENT: FLASHCARDS */}
            {activeTab === 'flashcards' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {flashcards.length === 0 ? (
                  <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No concept flashcards generated for this unit yet.
                  </Card>
                ) : (
                  <>
                    {/* Interactive Flip Card Viewer */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        style={{
                          width: '100%',
                          maxWidth: '650px',
                          minHeight: '260px',
                          backgroundColor: isFlipped ? 'var(--bg-secondary)' : 'var(--bg-card)',
                          border: isFlipped ? '2px solid var(--accent-amber)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          boxShadow: 'var(--shadow-md)',
                          transition: 'all 0.3s ease',
                          userSelect: 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                            {isFlipped ? 'ANSWER' : 'QUESTION'} ({currentCardIdx + 1} of {flashcards.length})
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Click to flip 🔄
                          </span>
                        </div>

                        <div style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)', textAlign: 'center', margin: '1.5rem 0', lineHeight: 1.6 }}>
                          {isFlipped
                            ? flashcards[currentCardIdx]?.answer
                            : flashcards[currentCardIdx]?.question}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCardKnown(currentCardIdx);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.375rem',
                              padding: '0.3rem 0.625rem',
                              borderRadius: 'var(--radius-sm)',
                              border: knownCards.has(currentCardIdx) ? '1px solid #22c55e' : '1px solid var(--border-color)',
                              backgroundColor: knownCards.has(currentCardIdx) ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                              color: knownCards.has(currentCardIdx) ? '#22c55e' : 'var(--text-muted)',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                            }}
                          >
                            <CheckCircle2 size={14} />
                            <span>{knownCards.has(currentCardIdx) ? 'Mastered' : 'Mark as Mastered'}</span>
                          </button>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                            {knownCards.size} / {flashcards.length} Mastered
                          </span>
                        </div>
                      </div>

                      {/* Card Controls Navigation */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentCardIdx === 0}
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentCardIdx((prev) => Math.max(0, prev - 1));
                          }}
                        >
                          <ChevronLeft size={16} />
                          <span>Previous</span>
                        </Button>

                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                          {currentCardIdx + 1} / {flashcards.length}
                        </span>

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentCardIdx === flashcards.length - 1}
                          onClick={() => {
                            setIsFlipped(false);
                            setCurrentCardIdx((prev) => Math.min(flashcards.length - 1, prev + 1));
                          }}
                        >
                          <span>Next</span>
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    </div>

                    {/* All Cards List */}
                    <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <h3 className="font-serif" style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                        All Flashcards List
                      </h3>
                      {flashcards.map((fc, i) => (
                        <Card key={i} style={{ padding: '1.25rem' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                            Q{i + 1}: {fc.question}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                            A: {fc.answer}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* TAB CONTENT: QUIZ */}
            {activeTab === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {quizQuestions.length === 0 ? (
                  <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No evaluation quiz questions generated for this unit yet.
                  </Card>
                ) : (
                  <>
                    {/* Quiz Questions List */}
                    {quizQuestions.map((q, qIdx) => {
                      const selectedOpt = userAnswers[qIdx];
                      const isCorrect = selectedOpt === q.correct_answer;

                      return (
                        <Card key={qIdx} style={{ padding: '1.5rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <h3 className="font-serif" style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                              {qIdx + 1}. {q.question}
                            </h3>
                            {submittedQuiz && (
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem', color: isCorrect ? '#22c55e' : '#ef4444' }}>
                                {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                {isCorrect ? 'Correct' : 'Incorrect'}
                              </span>
                            )}
                          </div>

                          {/* Options */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                            {q.options?.map((opt, oIdx) => {
                              const isSelected = selectedOpt === opt;
                              const isOptionCorrect = opt === q.correct_answer;

                              let bg = 'var(--bg-secondary)';
                              let border = '1px solid var(--border-color)';
                              let textColor = 'var(--text-primary)';

                              if (submittedQuiz) {
                                if (isOptionCorrect) {
                                  bg = 'rgba(34, 197, 94, 0.12)';
                                  border = '1px solid #22c55e';
                                  textColor = '#22c55e';
                                } else if (isSelected && !isOptionCorrect) {
                                  bg = 'rgba(239, 68, 68, 0.12)';
                                  border = '1px solid #ef4444';
                                  textColor = '#ef4444';
                                }
                              } else if (isSelected) {
                                bg = 'var(--accent-light)';
                                border = '1px solid var(--accent-amber)';
                                textColor = 'var(--accent-amber-hover)';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => handleSelectQuizOption(qIdx, opt)}
                                  disabled={submittedQuiz}
                                  style={{
                                    textAlign: 'left',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-sm)',
                                    backgroundColor: bg,
                                    border: border,
                                    color: textColor,
                                    fontSize: '0.875rem',
                                    fontWeight: isSelected || (submittedQuiz && isOptionCorrect) ? 600 : 400,
                                    cursor: submittedQuiz ? 'default' : 'pointer',
                                    transition: 'all 0.15s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <span>{opt}</span>
                                  {submittedQuiz && isOptionCorrect && (
                                    <CheckCircle2 size={16} color="#22c55e" />
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Explanation */}
                          {submittedQuiz && q.explanation && (
                            <div
                              style={{
                                borderTop: '1px dashed var(--border-color)',
                                paddingTop: '0.75rem',
                                fontSize: '0.8125rem',
                                color: 'var(--text-secondary)',
                                fontStyle: 'italic',
                              }}
                            >
                              <strong>Explanation:</strong> {q.explanation}
                            </div>
                          )}
                        </Card>
                      );
                    })}

                    {/* Quiz Controls & Score Bar */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                      {!submittedQuiz ? (
                        <Button
                          variant="primary"
                          onClick={() => setSubmittedQuiz(true)}
                          disabled={Object.keys(userAnswers).length === 0}
                        >
                          <CheckCircle2 size={16} />
                          <span>Submit Quiz ({Object.keys(userAnswers).length} / {quizQuestions.length} answered)</span>
                        </Button>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%', justifyContent: 'space-between' }}>
                          <div>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>QUIZ RESULT:</span>
                            <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
                              Score: {calculateScore()} / {quizQuestions.length} ({Math.round((calculateScore() / quizQuestions.length) * 100)}%)
                            </h3>
                          </div>
                          <Button variant="outline" onClick={handleResetQuiz}>
                            <RotateCcw size={14} />
                            <span>Retake Quiz</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
