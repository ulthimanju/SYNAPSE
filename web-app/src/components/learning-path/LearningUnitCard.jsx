import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { DifficultyBadge } from './DifficultyBadge';
import { PrerequisiteList } from './PrerequisiteList';
import { ObjectiveList } from './ObjectiveList';
import { Clock, BookOpen, Sparkles, X, Check, ArrowRight, RefreshCw, HelpCircle, Code2, Award, Briefcase } from 'lucide-react';
import { api } from '../../services/api';

export const LearningUnitCard = ({ unit, index, workspaceId }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unitContent, setUnitContent] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'flashcards' | 'quiz'

  // Student Opens Unit (SOU) -> Check Already Generated? (AG) -> Fetch/Generate Content
  const handleOpenUnit = async () => {
    setIsOpenModal(true);
    if (unitContent) return; // Already loaded locally

    setLoading(true);
    try {
      const res = await api.get(`/workspaces/${workspaceId}/units/${unit.id}`);
      if (res?.data) {
        setUnitContent(res.data);
      }
    } catch (err) {
      console.warn('Unit content fetch notice:', err);
    } finally {
      setLoading(false);
    }
  };

  const skillsGained = unit.skills_gained || [];
  const realWorldExamples = unit.real_world_examples || [];
  const practicalExercises = unit.practical_exercises || [];
  const keywords = unit.keywords || [];

  return (
    <>
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

        {/* Enriched Content Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1rem' }}>
          <ObjectiveList objectives={unit.learning_objectives} />
          <PrerequisiteList prerequisites={unit.prerequisites} />
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

      {/* Unit Deep-Dive Modal */}
      {isOpenModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem',
          }}
          onClick={() => setIsOpenModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%',
              maxWidth: '840px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-secondary)' }}>
              <div>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-amber)', fontFamily: 'var(--font-mono)' }}>
                  UNIT DEEP-DIVE CONTENT
                </span>
                <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>{unit.title}</h3>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
              <button
                onClick={() => setActiveTab('summary')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: activeTab === 'summary' ? 'var(--accent-amber-hover)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'summary' ? '2px solid var(--accent-amber)' : '2px solid transparent',
                  paddingBottom: '0.25rem',
                }}
              >
                Unit Summary
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: activeTab === 'flashcards' ? 'var(--accent-amber-hover)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'flashcards' ? '2px solid var(--accent-amber)' : '2px solid transparent',
                  paddingBottom: '0.25rem',
                }}
              >
                Flashcards ({unitContent?.flashcards?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: activeTab === 'quiz' ? 'var(--accent-amber-hover)' : 'var(--text-muted)',
                  borderBottom: activeTab === 'quiz' ? '2px solid var(--accent-amber)' : '2px solid transparent',
                  paddingBottom: '0.25rem',
                }}
              >
                Quiz Questions ({unitContent?.quiz?.questions?.length || 0})
              </button>
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
                  <RefreshCw size={24} className="animate-spin" style={{ color: 'var(--accent-amber)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    Generating concept-specific Summary + Flashcards + Quiz...
                  </span>
                </div>
              ) : (
                <>
                  {activeTab === 'summary' && (
                    <div style={{ lineHeight: 1.6, fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
                      <p style={{ whiteSpace: 'pre-line' }}>{unitContent?.unit_summary}</p>
                    </div>
                  )}

                  {activeTab === 'flashcards' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {unitContent?.flashcards?.map((fc, i) => (
                        <div key={i} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                            Q: {fc.question}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.5rem' }}>
                            A: {fc.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'quiz' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {unitContent?.quiz?.questions?.map((q, i) => (
                        <div key={i} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-secondary)' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', fontSize: '0.9375rem' }}>
                            {i + 1}. {q.question}
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '0.75rem' }}>
                            {q.options?.map((opt, oIdx) => (
                              <div
                                key={oIdx}
                                style={{
                                  padding: '0.5rem 0.75rem',
                                  borderRadius: 'var(--radius-sm)',
                                  backgroundColor: opt === q.correct_answer ? 'rgba(34, 197, 94, 0.1)' : 'var(--bg-card)',
                                  border: opt === q.correct_answer ? '1px solid #22c55e' : '1px solid var(--border-color)',
                                  fontSize: '0.8125rem',
                                  color: 'var(--text-primary)',
                                }}
                              >
                                {opt} {opt === q.correct_answer && '✓ (Correct)'}
                              </div>
                            ))}
                          </div>
                          {q.explanation && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                              Explanation: {q.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
