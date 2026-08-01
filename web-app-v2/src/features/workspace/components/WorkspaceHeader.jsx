import React from 'react';
import { Folder, ChevronDown } from 'lucide-react';

export const WorkspaceHeader = ({ workspace, documents = [], collaborators = [], onSwitchWorkspace }) => {
  // Calculate total file size in MB
  const totalSizeBytes = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0);
  const totalMb = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full bg-slate-900 border-b border-slate-800 px-8 py-6 space-y-4">
      {/* Breadcrumb */}
      <div className="text-xs font-mono tracking-wider text-slate-400 uppercase">
        WORKSPACES / <span className="text-blueprint-400 font-semibold">{workspace?.name || 'WORKSPACE'}</span>
      </div>

      {/* Main Title Row & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Left Title Section */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/5 mt-1">
            <Folder className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight font-sans">
              {workspace?.name || 'Loading workspace...'}
            </h1>

            <button
              onClick={onSwitchWorkspace}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-blueprint-400 hover:text-blueprint-300 transition cursor-pointer"
            >
              <span>Switch workspace</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Metric Stats */}
        <div className="flex items-center gap-8 bg-slate-950/60 px-6 py-3.5 rounded-2xl border border-slate-800/80">
          <div className="text-center">
            <p className="text-2xl font-extrabold text-white font-mono">{documents.length}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">DOCUMENTS</p>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div className="text-center">
            <p className="text-2xl font-extrabold text-white font-mono">{totalMb}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">MB TOTAL</p>
          </div>

          <div className="w-px h-8 bg-slate-800" />

          <div className="text-center">
            <p className="text-2xl font-extrabold text-white font-mono">{collaborators.length}</p>
            <p className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">COLLABORATORS</p>
          </div>
        </div>
      </div>
    </div>
  );
};
