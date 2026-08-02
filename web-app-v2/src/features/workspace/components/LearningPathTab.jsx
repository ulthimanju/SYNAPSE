import React, { useState } from 'react';
import { BookOpen, RefreshCw, Layers, CheckCircle2, HelpCircle, Eye, ArrowRight, Award } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const LearningPathTab = ({ learningPath, unitContent, isUnitLoading, onSelectUnit, onGenerate, isGenerating }) => {
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [activeUnitTab, setActiveUnitTab] = useState('summary'); // 'summary' | 'flashcards' | 'quiz'
  const [flippedCardIdx, setFlippedCardIdx] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const units = learningPath?.units || learningPath?.nodes || learningPath?.knowledge_graph?.nodes || [];

  const handleUnitClick = (unitId) => {
    setSelectedUnitId(unitId);
    setFlippedCardIdx(null);
    setSelectedAnswers({});
    onSelectUnit(unitId);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#cff4fc] border border-cyan-100 flex items-center justify-center text-[#0891b2] shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Neural Learning Path</h3>
            <p className="text-xs text-slate-400">Sequenced concept units generated from workspace documents</p>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1c3d98] hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Building Path...' : 'Generate Learning Path'}</span>
        </button>
      </div>

      {/* Units Flow & Deep Dive Viewport */}
      {units.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-800 font-bold text-base">No Learning Path Generated</p>
          <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
            Click "Generate Learning Path" to extract a structured curriculum graph from your uploaded documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Curriculum Units Roadmap */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
                CURRICULUM UNITS ({units.length})
              </h4>
            </div>

            <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
              {units.map((unit, idx) => {
                const unitId = unit.id || unit._id;
                const isSelected = selectedUnitId === unitId;

                return (
                  <div
                    key={unitId || idx}
                    onClick={() => handleUnitClick(unitId)}
                    className={`p-4 rounded-2xl border transition duration-200 cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#1c3d98] shadow-sm'
                        : 'bg-white border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition ${
                          isSelected
                            ? 'bg-[#1c3d98] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700'
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="min-w-0 truncate">
                        <h5 className={`font-bold text-sm truncate ${isSelected ? 'text-[#1c3d98]' : 'text-slate-800'}`}>
                          {unit.title}
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono truncate">
                          {unit.difficulty || 'Core Unit'} • {unit.estimated_time || '20 min'}
                        </p>
                      </div>
                    </div>

                    <ArrowRight className={`w-4 h-4 flex-shrink-0 transition ${isSelected ? 'text-[#1c3d98] translate-x-1' : 'text-slate-300 group-hover:text-blue-500'}`} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Unit Detailed Content Viewport */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedUnitId ? (
              <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-slate-800 font-bold text-base">Select a Unit</p>
                <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Select any curriculum unit on the left to view notes, flashcards, and quizzes.
                </p>
              </div>
            ) : isUnitLoading ? (
              <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
                <RefreshCw className="w-10 h-10 text-[#0891b2] animate-spin mx-auto" />
                <p className="text-slate-800 font-bold text-base">Fetching Unit Content...</p>
              </div>
            ) : (
              <div className="p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-6">
                {/* Unit Action Sub-Tabs */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 w-fit">
                  <button
                    onClick={() => setActiveUnitTab('summary')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeUnitTab === 'summary' ? 'bg-[#1c3d98] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Unit Summary
                  </button>
                  <button
                    onClick={() => setActiveUnitTab('flashcards')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeUnitTab === 'flashcards' ? 'bg-[#1c3d98] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Flashcards ({unitContent?.flashcards?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveUnitTab('quiz')}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeUnitTab === 'quiz' ? 'bg-[#1c3d98] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Self-Quiz
                  </button>
                </div>

                {/* Sub-Tab 1: Unit Summary */}
                {activeUnitTab === 'summary' && (
                  <div className="space-y-4 leading-relaxed text-slate-800">
                    <MarkdownRenderer
                      content={unitContent?.unit_summary || unitContent?.content || 'No summary content available for this unit.'}
                    />
                  </div>
                )}

                {/* Sub-Tab 2: Interactive Flashcards */}
                {activeUnitTab === 'flashcards' && (
                  <div className="space-y-6">
                    {(!unitContent?.flashcards || unitContent.flashcards.length === 0) ? (
                      <p className="text-xs text-slate-400 italic text-center py-8">No flashcards available for this unit.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {unitContent.flashcards.map((fc, idx) => {
                          const isFlipped = flippedCardIdx === idx;
                          return (
                            <div
                              key={idx}
                              onClick={() => setFlippedCardIdx(isFlipped ? null : idx)}
                              className="h-44 p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-400 transition shadow-sm cursor-pointer flex flex-col justify-between"
                            >
                              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                                CARD {idx + 1} • {isFlipped ? 'ANSWER' : 'QUESTION'}
                              </span>

                              <p className="text-sm font-semibold text-slate-800 line-clamp-3">
                                {isFlipped ? fc.answer : fc.question}
                              </p>

                              <span className="text-[11px] font-semibold text-blue-600 self-end">
                                {isFlipped ? 'Click for Question' : 'Click to Reveal Answer'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Tab 3: Self-Quiz */}
                {activeUnitTab === 'quiz' && (
                  <div className="space-y-6">
                    {(!unitContent?.quiz?.questions || unitContent.quiz.questions.length === 0) ? (
                      <p className="text-xs text-slate-400 italic text-center py-8">No quiz questions available for this unit.</p>
                    ) : (
                      <div className="space-y-6">
                        {unitContent.quiz.questions.map((q, qIdx) => (
                          <div key={qIdx} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                            <h5 className="font-bold text-sm text-slate-900">{qIdx + 1}. {q.question}</h5>

                            <div className="space-y-2">
                              {q.options?.map((opt, optIdx) => {
                                const isSelected = selectedAnswers[qIdx] === opt;
                                const isCorrect = opt === q.correct_answer;
                                const isAnswered = selectedAnswers[qIdx] !== undefined;

                                let btnStyle = 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
                                if (isAnswered) {
                                  if (isCorrect) btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold';
                                  else if (isSelected) btnStyle = 'bg-rose-50 border-rose-400 text-rose-800';
                                }

                                return (
                                  <button
                                    key={optIdx}
                                    onClick={() => setSelectedAnswers((prev) => ({ ...prev, [qIdx]: opt }))}
                                    className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${btnStyle}`}
                                  >
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>

                            {selectedAnswers[qIdx] && q.explanation && (
                              <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
                                💡 <strong>Explanation:</strong> {q.explanation}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
