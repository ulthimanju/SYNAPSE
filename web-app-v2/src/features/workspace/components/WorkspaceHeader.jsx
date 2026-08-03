import React from 'react';
import { Folder } from 'lucide-react';

export const WorkspaceHeader = ({ workspace, documents = [], collaborators = [], isLoading = false }) => {
  return (
    <div className="w-full bg-white border-b border-slate-200/80 px-10 py-6 space-y-4 shadow-sm">
      {/* Main Title Row & Metric Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Title Section */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#cff4fc] border border-cyan-200 flex items-center justify-center text-[#0891b2] shadow-sm">
            <Folder className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {isLoading ? 'Loading workspace...' : workspace?.name || 'Workspace'}
            </h1>
          </div>
        </div>

        {/* Right Metric Stats */}
        <div className="flex items-center gap-10">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 font-mono">{isLoading ? '—' : documents.length}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">DOCUMENTS</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 font-mono">{isLoading ? '—' : collaborators.length}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">COLLABORATORS</p>
          </div>
        </div>
      </div>
    </div>
  );
};

