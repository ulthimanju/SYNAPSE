import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Badge } from '../common/Badge';
import { Alert } from '../feedback/Alert';
import { UserPlus, Trash2, Crown, User, ShieldCheck } from 'lucide-react';
import {
  useCollaboratorsQuery,
  useInviteCollaboratorMutation,
  useRemoveCollaboratorMutation,
} from '../../hooks/useWorkspacesQuery';

export const CollaboratorList = ({ workspaceId, isOwner }) => {
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const { data: collaborators = [], isLoading: loading } = useCollaboratorsQuery(workspaceId);
  const inviteMutation = useInviteCollaboratorMutation(workspaceId);
  const removeMutation = useRemoveCollaboratorMutation(workspaceId);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !email.trim()) return;
    setNotice(null);
    setErrorMsg(null);

    inviteMutation.mutate(email.trim(), {
      onSuccess: () => {
        setNotice(`Collaborator (${email.trim()}) invited successfully.`);
        setEmail('');
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to invite collaborator.');
      },
    });
  };

  const handleRemove = async (targetIdOrEmail) => {
    if (!window.confirm(`Are you sure you want to remove this collaborator?`)) return;
    setNotice(null);
    setErrorMsg(null);

    removeMutation.mutate(targetIdOrEmail, {
      onSuccess: () => {
        setNotice('Collaborator removed successfully.');
      },
      onError: (err) => {
        setErrorMsg(err.response?.data?.message || err.message || 'Failed to remove collaborator.');
      },
    });
  };

  return (
    <Card style={{ padding: '1.5rem', maxWidth: '720px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <div>
          <h3 className="font-serif" style={{ fontSize: '1.25rem', color: 'var(--text-primary)', margin: 0 }}>
            Workspace Collaborators
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Invite members to view documents and run RAG search. Workspace modifications remain restricted to the owner.
          </p>
        </div>
        {!isOwner && (
          <Badge variant="outline" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ShieldCheck size={12} style={{ color: 'var(--accent-amber)' }} />
            <span>Collaborator (View Only Changes)</span>
          </Badge>
        )}
      </div>

      {notice && <Alert type="info" message={notice} style={{ marginBottom: '1rem' }} />}
      {errorMsg && <Alert type="info" message={errorMsg} style={{ marginBottom: '1rem' }} />}

      {/* Invite Form (Owner Only) */}
      {isOwner && (
        <form onSubmit={handleInvite} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1 }}>
            <Input
              type="email"
              placeholder="Enter collaborator email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={inviteMutation.isPending}>
            <UserPlus size={16} />
            <span>{inviteMutation.isPending ? 'Inviting...' : 'Invite Collaborator'}</span>
          </Button>
        </form>
      )}

      {/* Collaborator List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Loading collaborators...
          </div>
        ) : collaborators.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            No collaborators added yet.
          </div>
        ) : (
          collaborators.map((c) => {
            const isMemberOwner = c.role === 'owner';
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isMemberOwner ? 'var(--accent-amber)' : 'var(--bg-card)',
                      color: isMemberOwner ? '#FFFFFF' : 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    {isMemberOwner ? <Crown size={16} /> : <User size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {c.email || c.user_id}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Joined {c.joined_at ? new Date(c.joined_at).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Badge variant={isMemberOwner ? 'accent' : 'outline'} style={{ fontSize: '0.75rem' }}>
                    {isMemberOwner ? 'Owner' : 'Collaborator'}
                  </Badge>

                  {isOwner && !isMemberOwner && (
                    <button
                      onClick={() => handleRemove(c.user_id || c.email)}
                      disabled={removeMutation.isPending}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#ef4444',
                        padding: '0.375rem',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: removeMutation.isPending ? 0.5 : 1,
                      }}
                      title="Remove Collaborator"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
