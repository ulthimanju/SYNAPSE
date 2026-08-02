import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Clock, BookOpen, Layers, Code, Table as TableIcon } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const SummaryTab = ({ summary, isLoading, isGenerating, onGenerate }) => {
  // Extract fields returned by workspace-service backend (overview, title, key_topics, code_examples, etc.)
  const overview = summary?.overview || summary?.summary_text || summary?.content || summary?.data?.overview;
  const title = summary?.title || 'Executive Summary';
  const keyTopics = summary?.key_topics || [];
  const codeExamples = summary?.code_examples || [];
  const comparisonTables = summary?.comparison_tables || [];
  const visualizations = summary?.visualizations || [];
  const difficulty = summary?.difficulty;
  const studyTime = summary?.estimated_study_time;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blueprint-500/20 border border-blueprint-500/30 flex items-center justify-center text-blueprint-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">{title}</h3>
            <p className="text-xs text-slate-400">Synthesized from uploaded workspace documents via Gemini AI</p>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blueprint-600 hover:bg-blueprint-500 text-white font-semibold text-xs shadow-lg shadow-blueprint-600/30 transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Synthesizing...' : 'Regenerate Summary'}</span>
        </button>
      </div>

      {/* Content Container */}
      {isLoading || isGenerating ? (
        <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <RefreshCw className="w-10 h-10 text-blueprint-400 animate-spin mx-auto" />
          <p className="text-white font-semibold text-base">Synthesizing Executive Summary...</p>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Analyzing document embeddings and extracting key principles, KaTeX formulas, and architectural insights via Google Gemini LLM.
          </p>
        </div>
      ) : overview ? (
        <div className="space-y-6">
          {/* Metadata Badges */}
          {(difficulty || studyTime || keyTopics.length > 0) && (
            <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
              {difficulty && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{difficulty}</span>
                </span>
              )}
              {studyTime && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{studyTime}</span>
                </span>
              )}
              {keyTopics.map((topic, i) => (
                <span key={i} className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-slate-100 text-slate-600 border border-slate-200">
                  #{topic}
                </span>
              ))}
            </div>
          )}

          {/* Overview Markdown Content */}
          <div className="p-8 md:p-10 rounded-3xl bg-white border border-slate-200/80 shadow-sm leading-relaxed text-slate-800">
            <MarkdownRenderer content={overview} />
          </div>

          {/* Code Examples Section */}
          {codeExamples.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900 font-sans uppercase tracking-wider">Code Implementations</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {codeExamples.map((ex, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <h5 className="font-bold text-xs text-blue-400 font-mono">{ex.title}</h5>
                    <MarkdownRenderer content={`\`\`\`${ex.language || 'c'}\n${ex.code}\n\`\`\``} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Tables Section */}
          {comparisonTables.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900 font-sans uppercase tracking-wider">Architectural Comparisons</h4>
              </div>
              {comparisonTables.map((tbl, idx) => (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 overflow-x-auto">
                  <h5 className="font-bold text-xs text-slate-900 font-sans">{tbl.title}</h5>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        {tbl.headers?.map((h, i) => (
                          <th key={i} className="p-3 font-mono font-bold text-slate-600">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.rows?.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50/50">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3 text-slate-700 font-sans">{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-slate-800 font-semibold text-base">No Executive Summary Available</p>
          <p className="text-slate-400 text-xs max-w-md mx-auto">
            Click "Regenerate Summary" above to generate a comprehensive AI synthesis of your uploaded documents.
          </p>
        </div>
      )}
    </div>
  );
};
