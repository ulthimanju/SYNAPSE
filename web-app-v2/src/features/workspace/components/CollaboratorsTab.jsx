import React, { useState } from 'react';
import { Users, UserPlus, Trash2, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export const CollaboratorsTab = ({ collaborators = [], onAddCollaborator, onRemoveCollaborator, isAdding, isRemoving }) => {
  const [emailInput, setEmailInput] = useState('');
  const [roleInput, setRoleInput] = useState('viewer');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!emailInput.trim() || isAdding) return;

    try {
      await onAddCollaborator({ email: emailInput, role: roleInput });
      toast.success(`Invited '${emailInput}' successfully!`);
      setEmailInput('');
    } catch (err) {
      toast.error('Failed to add collaborator.');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Add Collaborator Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blueprint-500/20 border border-blueprint-500/30 flex items-center justify-center text-blueprint-400">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Invite Workspace Collaborator</h3>
            <p className="text-xs text-slate-400">Add team members by email address to share workspace documents & learning paths</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Mail className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter user email address..."
              required
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-sans focus:outline-none focus:border-blueprint-500"
            />
          </div>

          <select
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-sans focus:outline-none focus:border-blueprint-500"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            disabled={isAdding || !emailInput.trim()}
            className="px-6 py-3 rounded-xl bg-blueprint-600 hover:bg-blueprint-500 disabled:opacity-40 text-white font-semibold text-xs transition cursor-pointer whitespace-nowrap"
          >
            {isAdding ? 'Inviting...' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Collaborator List */}
      <div className="space-y-4">
        <h4 className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase">
          ACTIVE COLLABORATORS ({collaborators.length})
        </h4>

        {collaborators.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-medium text-sm">No collaborators added yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {collaborators.map((c, idx) => {
              const displayEmail = c.email || c.user_email || c.user_id || 'Collaborator';
              return (
                <div
                  key={c.id || c._id || idx}
                  className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blueprint-900 border border-blueprint-500/40 flex items-center justify-center text-xs font-bold text-blueprint-200 uppercase">
                      {displayEmail[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-white font-sans">{displayEmail}</p>
                      <p className="text-[11px] text-slate-400 font-mono">Role: {c.role || 'Member'}</p>
                    </div>
                  </div>

                  {c.role !== 'owner' && (
                    <button
                      onClick={() => onRemoveCollaborator(c.id || c.collaborator_id || c.user_id)}
                      disabled={isRemoving}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Remove Collaborator"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
