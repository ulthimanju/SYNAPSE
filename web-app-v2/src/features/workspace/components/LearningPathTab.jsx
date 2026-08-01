import React, { useState } from 'react';
import { BookOpen, RefreshCw, Layers, CheckCircle2, HelpCircle, Eye, ArrowRight, Award } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const LearningPathTab = ({ learningPath, unitContent, isUnitLoading, onSelectUnit, onGenerate, isGenerating }) => {
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [activeUnitTab, setActiveUnitTab] = useState('summary'); // 'summary' | 'flashcards' | 'quiz'
  const [flippedCardIdx, setFlippedCardIdx] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const units = learningPath?.units || learningPath?.knowledge_graph?.nodes || [];

  const handleUnitClick = (unitId) => {
    setSelectedUnitId(unitId);
    setFlippedCardIdx(null);
    setSelectedAnswers({});
    onSelectUnit(unitId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Neural Learning Path</h3>
            <p className="text-xs text-slate-400">Sequenced concept units generated from workspace documents</p>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Building Path...' : 'Generate Learning Path'}</span>
        </button>
      </div>

      {/* Units Roadmap Flow & Deep Dive */}
      {units.length === 0 ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <Layers className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-slate-300 font-semibold text-base">No Learning Path Generated</p>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Click "Generate Learning Path" to extract a structured curriculum graph from your documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Units Roadmap List */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase mb-4">
              CURRICULUM UNITS ({units.length})
            </h4>

            {units.map((unit, idx) => {
              const uId = unit.id || unit.unit_id || idx + 1;
              const isSelected = String(selectedUnitId) === String(uId);

              return (
                <button
                  key={uId}
                  onClick={() => handleUnitClick(uId)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500 text-white shadow-lg'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${
                        isSelected ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-sm font-sans">{unit.title || `Unit ${uId}`}</p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {(unit.keywords || unit.topics || []).slice(0, 2).join(' • ') || 'Core Concept'}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className={`w-4 h-4 transition ${isSelected ? 'text-purple-400' : 'text-slate-600 group-hover:text-slate-400'}`} />
                </button>
              );
            })}
          </div>

          {/* Right Selected Unit Deep Dive */}
          <div className="lg:col-span-2 space-y-6">
            {!selectedUnitId ? (
              <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <BookOpen className="w-10 h-10 text-purple-400/50 mx-auto" />
                <p className="text-white font-medium text-sm">Select a Learning Unit to Begin</p>
                <p className="text-slate-500 text-xs">Choose any unit from the left roadmap to explore its grounded summary, flashcard deck, and quiz.</p>
              </div>
            ) : isUnitLoading ? (
              <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                <p className="text-white font-medium text-sm">RAG Grounding Unit Content...</p>
              </div>
            ) : unitContent ? (
              <div className="space-y-6">
                {/* Unit Sub-Tabs */}
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <button
                    onClick={() => setActiveUnitTab('summary')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeUnitTab === 'summary' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Unit Summary
                  </button>
                  <button
                    onClick={() => setActiveUnitTab('flashcards')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeUnitTab === 'flashcards' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Flashcards ({unitContent.flashcards?.length || 0})
                  </button>
                  <button
                    onClick={() => setActiveUnitTab('quiz')}
                    className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition cursor-pointer ${
                      activeUnitTab === 'quiz' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Quiz ({unitContent.quiz?.questions?.length || 0})
                  </button>
                </div>

                {/* Sub-Tab 1: Summary */}
                {activeUnitTab === 'summary' && (
                  <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-lg">
                    <MarkdownRenderer content={unitContent.unit_summary} />
                  </div>
                )}

                {/* Sub-Tab 2: Flashcards */}
                {activeUnitTab === 'flashcards' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(unitContent.flashcards || []).map((card, idx) => {
                      const isFlipped = flippedCardIdx === idx;
                      return (
                        <div
                          key={idx}
                          onClick={() => setFlippedCardIdx(isFlipped ? null : idx)}
                          className="h-56 p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition cursor-pointer flex flex-col justify-between select-none shadow-md group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase">
                              CARD #{idx + 1}
                            </span>
                            <span className="text-xs text-slate-500 group-hover:text-purple-300 transition">
                              {isFlipped ? 'Click to show question' : 'Click to flip answer'}
                            </span>
                          </div>

                          <div className="my-auto">
                            <p className="text-sm font-medium text-white leading-relaxed font-sans">
                              {isFlipped ? card.answer : card.question}
                            </p>
                          </div>

                          <div className="text-[11px] font-mono text-slate-500">
                            Difficulty: <span className="text-purple-300">{card.difficulty || 'Medium'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Sub-Tab 3: Quiz */}
                {activeUnitTab === 'quiz' && (
                  <div className="space-y-6">
                    {(unitContent.quiz?.questions || []).map((q, qIdx) => {
                      const selectedOpt = selectedAnswers[qIdx];
                      return (
                        <div key={qIdx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                          <p className="font-semibold text-sm text-white font-sans">
                            Q{qIdx + 1}. {q.question}
                          </p>

                          <div className="space-y-2">
                            {(q.options || []).map((opt, oIdx) => {
                              const isSelected = selectedOpt === opt;
                              const isCorrect = opt === q.correct_answer;
                              const showFeedback = selectedOpt !== undefined;

                              let btnStyle = 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700';
                              if (showFeedback) {
                                if (isCorrect) btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-300';
                                else if (isSelected) btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-300';
                              }

                              return (
                                <button
                                  key={oIdx}
                                  onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: opt })}
                                  className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition cursor-pointer ${btnStyle}`}
                                >
                                  {opt}
                                </button>
                              );
                            })}
                          </div>

                          {selectedOpt && (
                            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1 font-sans">
                              <p className="font-semibold text-purple-300">Explanation:</p>
                              <p>{q.explanation}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
