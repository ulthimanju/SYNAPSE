import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { Folder, Plus, Trash2, ArrowRight } from 'lucide-react';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';

export const WorkspaceListPage = () => {
  const navigate = useNavigate();
  const { workspaces, isLoading, createWorkspace, isCreating, deleteWorkspace } = useWorkspaces();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const defaultWorkspaces = [
    {
      id: 'operating_system',
      name: 'Operating system',
      description: 'Core concepts of Process Management, Virtual Memory, Scheduling & File Systems.',
      document_count: 2,
    },
  ];

  const displayWorkspaces = workspaces && workspaces.length > 0 ? workspaces : defaultWorkspaces;

  return (
    <div className="w-full max-w-7xl mx-auto p-10 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight font-sans">Your Neural Workspaces</h1>
          <p className="text-xs text-slate-400">Select an active domain to view documents, RAG assistant, and learning paths</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md transition active:scale-98 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Workspace</span>
        </button>
      </div>

      {/* Grid of Workspaces */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-3xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayWorkspaces.map((ws, idx) => {
            const wsId = ws.id || ws._id || ws.workspace_id || `ws-${idx}`;
            return (
              <div
                key={wsId}
                onClick={() => navigate(`/workspaces?workspace=${wsId}&tab=documents`)}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-blue-500/50 transition duration-300 shadow-sm hover:shadow-md cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-[#cff4fc] border border-cyan-100 flex items-center justify-center text-[#0891b2] group-hover:scale-105 transition">
                      <Folder className="w-6 h-6" />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete '${ws.name}'?`)) {
                          deleteWorkspace(wsId);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Delete Workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900 font-sans truncate">{ws.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {ws.description || 'No description provided.'}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
                  <span className="text-[11px] font-mono text-slate-400 font-semibold">
                    {ws.document_count || 0} documents
                  </span>

                  <div className="flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:text-blue-700 transition">
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={createWorkspace}
        isCreating={isCreating}
      />
    </div>
  );
};
