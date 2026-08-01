import React from 'react';
import { Folder, ChevronDown } from 'lucide-react';

export const WorkspaceHeader = ({ workspace, documents = [], collaborators = [], onSwitchWorkspace }) => {
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const totalMb = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full bg-white border-b border-slate-200/80 px-10 py-6 space-y-4 shadow-sm">
      {/* Breadcrumb */}
      <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase font-semibold">
        WORKSPACES / <span className="text-blue-600 font-bold">{workspace?.name || 'WORKSPACE'}</span>
      </div>

      {/* Main Title Row & Metric Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Title Section */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#cff4fc] border border-cyan-200 flex items-center justify-center text-[#0891b2] shadow-sm mt-0.5">
            <Folder className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              {workspace?.name || 'Loading workspace...'}
            </h1>

            <button
              onClick={onSwitchWorkspace}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition cursor-pointer"
            >
              <span>Switch workspace</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Metric Stats */}
        <div className="flex items-center gap-10">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 font-mono">{documents.length}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">DOCUMENTS</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 font-mono">{totalMb}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">MB TOTAL</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 font-mono">{collaborators.length}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 font-bold uppercase">COLLABORATORS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
