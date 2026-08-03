import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Code, Table as TableIcon, CheckCircle2 } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const SummaryTab = ({ summary, isSummaryGenerated, isLoading, isGenerating, onGenerate }) => {
  const overview = summary?.overview || summary?.summary_text || summary?.content || summary?.data?.overview;
  const title = summary?.title || 'Executive Summary';
  const keyTopics = summary?.key_topics || [];
  const codeExamples = summary?.code_examples || [];
  const comparisonTables = summary?.comparison_tables || [];
  const difficulty = summary?.difficulty;
  const studyTime = summary?.estimated_study_time;

  const hasValidSummary = Boolean(isSummaryGenerated || overview);
  const buttonLabel = isGenerating
    ? 'Synthesizing...'
    : hasValidSummary
    ? 'Regenerate Summary'
    : 'Generate Summary';

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner & Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#cff4fc] border border-cyan-100 flex items-center justify-center text-[#0891b2] shadow-sm">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 font-sans tracking-tight">{title}</h3>
            <p className="text-xs text-slate-400 font-sans">Synthesized from uploaded workspace documents via Gemini AI</p>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1c3d98] hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{buttonLabel}</span>
        </button>
      </div>

      {/* Content Viewport */}
      {isLoading || isGenerating ? (
        <div className="p-16 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <RefreshCw className="w-10 h-10 text-[#0891b2] animate-spin mx-auto" />
          <p className="text-slate-900 font-bold text-base font-sans">Synthesizing Executive Summary...</p>
          <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
            Analyzing document embeddings and extracting key principles, KaTeX formulas, and architectural insights via Google Gemini LLM.
          </p>
        </div>
      ) : overview ? (
        <div className="space-y-6">
          {/* Main Executive Summary Document Paper */}
          <div className="p-8 md:p-12 rounded-3xl bg-white border border-slate-200/80 shadow-sm leading-relaxed text-slate-800 font-sans">
            <MarkdownRenderer content={overview} />
          </div>

          {/* Code Examples Section */}
          {codeExamples.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-[#1c3d98]" />
                <h4 className="font-bold text-xs text-slate-500 font-sans uppercase tracking-widest">Code Implementations</h4>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {codeExamples.map((ex, idx) => (
                  <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200/80 space-y-3 shadow-sm">
                    <h5 className="font-bold text-sm text-blue-900 font-mono">{ex.title}</h5>
                    <MarkdownRenderer content={`\`\`\`${ex.language || 'c'}\n${ex.code}\n\`\`\``} dark={false} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Tables Section */}
          {comparisonTables.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <TableIcon className="w-4 h-4 text-[#0891b2]" />
                <h4 className="font-bold text-xs text-slate-500 font-sans uppercase tracking-widest">Architectural Comparisons</h4>
              </div>
              {comparisonTables.map((tbl, idx) => (
                <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4 overflow-x-auto">
                  <h5 className="font-bold text-sm text-slate-900 font-sans">{tbl.title}</h5>
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80">
                        {tbl.headers?.map((h, i) => (
                          <th key={i} className="p-3.5 font-mono font-bold text-slate-700">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tbl.rows?.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50/60 transition">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-3.5 text-slate-700 font-sans leading-relaxed">{cell}</td>
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
          <AlertCircle className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-800 font-bold text-base font-sans">No Executive Summary Available</p>
          <p className="text-slate-400 text-xs max-w-md mx-auto leading-relaxed">
            Click "{buttonLabel}" above to synthesize a comprehensive AI overview of your uploaded documents.
          </p>
        </div>
      )}
    </div>
  );
};
