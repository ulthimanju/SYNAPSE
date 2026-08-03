import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Code, Table as TableIcon, FileText } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const SummaryTab = ({ summary, isSummaryGenerated, isLoading, isGenerating, onGenerate }) => {
  const overview      = summary?.overview || summary?.summary_text || summary?.content || summary?.data?.overview;
  const title         = summary?.title || 'Executive Summary';
  const codeExamples  = summary?.code_examples || [];
  const comparisonTables = summary?.comparison_tables || [];

  const hasValidSummary = Boolean(isSummaryGenerated || overview);
  const buttonLabel = isGenerating
    ? 'Synthesizing...'
    : hasValidSummary
    ? 'Regenerate Summary'
    : 'Generate Summary';

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 animate-fadeIn pb-8">

      {/* ── Top Banner ────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#cff4fc] border border-cyan-200 flex items-center justify-center text-[#0891b2] flex-shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 tracking-tight leading-tight">{title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Synthesized from workspace documents via Gemini AI</p>
          </div>
        </div>

        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#1c3d98] hover:bg-blue-800 text-white font-semibold text-xs shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          {buttonLabel}
        </button>
      </div>

      {/* ── Content ───────────────────────────────────── */}
      {isLoading || isGenerating ? (

        // Loading state
        <div className="px-6 py-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0891b2] animate-spin mx-auto" />
          <p className="text-slate-800 font-bold text-sm">Synthesizing Executive Summary...</p>
          <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
            Analyzing embeddings and extracting key principles via Google Gemini LLM.
          </p>
        </div>

      ) : overview ? (
        <div className="space-y-4">

          {/* ── Main Summary ── */}
          <div className="px-6 py-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
              <FileText className="w-3.5 h-3.5 text-[#1c3d98]" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Overview</span>
            </div>
            <MarkdownRenderer content={overview} dark={false} />
          </div>

          {/* ── Code Examples ── */}
          {codeExamples.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Code className="w-3.5 h-3.5 text-[#1c3d98]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Code Implementations</span>
              </div>
              <div className="space-y-3">
                {codeExamples.map((ex, idx) => (
                  <div key={idx} className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                    {/* Card header */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200">
                      <Code className="w-3.5 h-3.5 text-[#1c3d98]" />
                      <span className="text-xs font-bold text-[#1c3d98] font-mono">{ex.title}</span>
                    </div>
                    <div className="p-3">
                      <MarkdownRenderer
                        content={`\`\`\`${ex.language || 'text'}\n${ex.code}\n\`\`\``}
                        dark={false}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Comparison Tables ── */}
          {comparisonTables.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <TableIcon className="w-3.5 h-3.5 text-[#0891b2]" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Architectural Comparisons</span>
              </div>
              {comparisonTables.map((tbl, idx) => (
                <div key={idx} className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex justify-center">
                    <span className="text-xs font-bold text-slate-700 font-sans text-center">{tbl.title}</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          {tbl.headers?.map((h, i) => (
                            <th key={i} className="px-3 py-2 bg-[#1c3d98] text-white font-semibold text-left font-mono border border-blue-800">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tbl.rows?.map((row, rIdx) => (
                          <tr key={rIdx} className="even:bg-slate-50/70 hover:bg-blue-50/40 transition">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="px-3 py-2 text-slate-700 border border-slate-200 align-top leading-relaxed">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      ) : (

        // Empty state
        <div className="px-6 py-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-200 mx-auto" />
          <p className="text-slate-700 font-bold text-sm">No Summary Available</p>
          <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
            Click &ldquo;{buttonLabel}&rdquo; above to synthesize an AI overview of your documents.
          </p>
        </div>

      )}
    </div>
  );
};
