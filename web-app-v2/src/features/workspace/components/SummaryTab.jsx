import React from 'react';
import { Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { MarkdownRenderer } from '../../../components/common/MarkdownRenderer';

export const SummaryTab = ({ summary, isLoading, isGenerating, onGenerate }) => {
  const summaryText = summary?.summary_text || summary?.content || summary?.data?.summary_text;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Banner & Refresh Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blueprint-500/20 border border-blueprint-500/30 flex items-center justify-center text-blueprint-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">AI Executive Summary</h3>
            <p className="text-xs text-slate-400">Synthesized from uploaded workspace documents</p>
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
      ) : summaryText ? (
        <div className="p-8 md:p-10 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <MarkdownRenderer content={summaryText} />
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-slate-300 font-semibold text-base">No Executive Summary Available</p>
          <p className="text-slate-500 text-xs max-w-md mx-auto">
            Click "Regenerate Summary" above to generate a comprehensive AI synthesis of your uploaded documents.
          </p>
        </div>
      )}
    </div>
  );
};
