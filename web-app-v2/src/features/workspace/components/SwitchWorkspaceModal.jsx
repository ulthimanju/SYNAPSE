import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Folder, Plus, Check } from 'lucide-react';

import { useWorkspace } from '../context/WorkspaceContext';

export const SwitchWorkspaceModal = ({ isOpen, onClose, workspaces = [], currentWorkspaceId, onOpenCreate }) => {
  const { switchWorkspace } = useWorkspace();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blueprint-500/20 border border-blueprint-500/30 flex items-center justify-center text-blueprint-400">
              <Folder className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-white">Switch Workspace</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {workspaces.map((ws) => {
            const isSelected = String(ws.id) === String(currentWorkspaceId);
            return (
              <button
                key={ws.id}
                onClick={() => {
                  const wsId = ws.id || ws._id || ws.workspace_id;
                  switchWorkspace(wsId);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'bg-blueprint-950/50 border-blueprint-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelected ? 'bg-blueprint-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Folder className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-xs font-sans">{ws.name}</span>
                </div>

                {isSelected && <Check className="w-4 h-4 text-blueprint-400" />}
              </button>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              onClose();
              onOpenCreate();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blueprint-600 hover:bg-blueprint-500 text-white font-semibold text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
};
