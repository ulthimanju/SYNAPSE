import React from 'react';
import { Folder } from 'lucide-react';

export const WorkspaceHeader = ({ workspace, documents = [], collaborators = [], isLoading = false }) => {
  return (
    <div className="w-full bg-white border-b border-slate-200/80 px-6 py-3.5 shadow-xs">
      <div className="flex items-center justify-between gap-4">
        {/* Left Title Section */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#cff4fc] border border-cyan-200 flex items-center justify-center text-[#0891b2] shadow-xs">
            <Folder className="w-4 h-4" />
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans">
            {isLoading ? 'Loading workspace...' : workspace?.name || 'Workspace'}
          </h1>
        </div>

        {/* Right Metric Stats */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 font-mono">{isLoading ? '—' : documents.length}</span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">DOCUMENTS</span>
          </div>

          <div className="h-3.5 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 font-mono">{isLoading ? '—' : collaborators.length}</span>
            <span className="text-[10px] font-mono tracking-wider text-slate-400 font-bold uppercase">COLLABORATORS</span>
          </div>
        </div>
      </div>
    </div>
  );
};


