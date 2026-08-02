import React, { useState } from 'react';
import { Users, UserPlus, Shield, Trash2, Mail, CheckCircle2 } from 'lucide-react';

export const CollaboratorsTab = ({ collaborators = [], onAddCollaborator, onRemoveCollaborator, isAdding, isRemoving }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!email.trim() || isAdding) return;
    onAddCollaborator({ email: email.trim(), role });
    setEmail('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn font-sans">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#cff4fc] border border-cyan-100 flex items-center justify-center text-[#0891b2] shadow-sm">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Workspace Collaborators</h3>
            <p className="text-xs text-slate-400">Invite team members to read, edit, or manage this workspace</p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#cff4fc] text-[#0891b2] border border-cyan-100 w-fit">
          {collaborators.length} Members
        </span>
      </div>

      {/* Invite Member Section */}
      <form onSubmit={handleAdd} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          INVITE NEW COLLABORATOR
        </h4>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@university.edu"
              required
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-[#1c3d98]"
            />
          </div>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-[#1c3d98]"
          >
            <option value="viewer">Viewer (Read Only)</option>
            <option value="editor">Editor (Can Upload)</option>
            <option value="admin">Admin (Full Control)</option>
          </select>

          <button
            type="submit"
            disabled={!email.trim() || isAdding}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#1c3d98] hover:bg-blue-800 text-white font-semibold text-xs shadow-md transition active:scale-98 cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{isAdding ? 'Inviting...' : 'Invite Member'}</span>
          </button>
        </div>
      </form>

      {/* Collaborators List */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase px-1">
          ACTIVE MEMBERS ({collaborators.length})
        </h4>

        {collaborators.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-slate-200/80 shadow-sm space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-slate-800 font-bold text-sm">No Collaborators Yet</p>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Use the form above to invite team members to collaborate on documents and study paths.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {collaborators.map((collab) => {
              const collabId = collab.id || collab._id;
              const isOwner = collab.role === 'owner';

              return (
                <div
                  key={collabId}
                  className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition shadow-sm"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#1c3d98] text-white flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                      {(collab.email || collab.user_id || 'U')[0].toUpperCase()}
                    </div>

                    <div className="min-w-0 truncate">
                      <h5 className="font-bold text-sm text-slate-800 truncate">
                        {collab.email || `User (${collab.user_id?.slice(0, 8)})`}
                      </h5>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Joined {collab.joined_at ? new Date(collab.joined_at).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold capitalize ${
                        isOwner
                          ? 'bg-[#cff4fc] text-[#0891b2] border border-cyan-100'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {collab.role}
                    </span>

                    {!isOwner && (
                      <button
                        onClick={() => onRemoveCollaborator(collabId)}
                        disabled={isRemoving}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
