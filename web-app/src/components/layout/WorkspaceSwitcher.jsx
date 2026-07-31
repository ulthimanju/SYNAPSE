import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, FolderKanban, Plus, Loader2, Trash2, Users, Crown } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { CreateWorkspaceDialog } from '../workspace/CreateWorkspaceDialog';
import { DeleteWorkspaceModal } from '../workspace/DeleteWorkspaceModal';
import { api } from '../../services/api';

export const WorkspaceSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [switcherTab, setSwitcherTab] = useState('owned'); // 'owned' | 'collaborated'
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [hoveredWsId, setHoveredWsId] = useState(null);
  
  const [targetDeleteWs, setTargetDeleteWs] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { activeWorkspaceId, setActiveWorkspaceId, workspaces, setWorkspaces } = useAppStore();
  const navigate = useNavigate();

  const fetchWorkspaces = useCallback(async (force = false) => {
    if (workspaces.length > 0 && !force) {
      if (!activeWorkspaceId && workspaces.length > 0) {
        setActiveWorkspaceId(workspaces[0].id);
      }
      return;
    }

    setLoading(true);
    try {
      const res = await api.get('/workspaces/titles');
      const list = res?.data?.data || res?.data || [];
      if (Array.isArray(list)) {
        setWorkspaces(list);
        if (list.length > 0 && !activeWorkspaceId) {
          setActiveWorkspaceId(list[0].id);
        }
      } else {
        setWorkspaces([]);
      }
    } catch (err) {
      console.error('Error loading workspaces for topbar switcher');
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId, setActiveWorkspaceId, workspaces, setWorkspaces]);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const current = workspaces.find((w) => w.id === activeWorkspaceId);
    if (current && (current.is_owner === false || current.role === 'collaborator')) {
      setSwitcherTab('collaborated');
    } else {
      setSwitcherTab('owned');
    }
  }, [activeWorkspaceId, workspaces]);

  const handleSelectWorkspace = (wsId) => {
    setActiveWorkspaceId(wsId);
    setOpen(false);
    navigate(`/workspaces/${wsId}`);
  };

  const handlePromptDelete = (e, ws) => {
    e.stopPropagation();
    setTargetDeleteWs(ws);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteWorkspace = async () => {
    if (!targetDeleteWs) return;

    setDeleteLoading(true);
    try {
      await api.delete(`/workspaces/${targetDeleteWs.id}`);
      const updatedList = workspaces.filter((w) => w.id !== targetDeleteWs.id);
      setWorkspaces(updatedList);

      if (targetDeleteWs.id === activeWorkspaceId) {
        if (updatedList.length > 0) {
          const nextWs = updatedList[0];
          setActiveWorkspaceId(nextWs.id);
          navigate(`/workspaces/${nextWs.id}`);
        } else {
          setActiveWorkspaceId(null);
          navigate('/dashboard');
        }
      }
      setIsDeleteModalOpen(false);
      setTargetDeleteWs(null);
    } catch (err) {
      console.error(`Failed to delete workspace ${targetDeleteWs.name}:`, err);
      alert(`Failed to delete workspace "${targetDeleteWs.name}". Please try again.`);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateWorkspace = async (formData) => {
    setCreateLoading(true);
    try {
      const res = await api.post('/workspaces', formData);
      const newWs = res?.data?.data || res?.data;
      if (newWs?.id) {
        setWorkspaces([newWs, ...workspaces]);
        setActiveWorkspaceId(newWs.id);
        setIsDialogOpen(false);
        navigate(`/workspaces/${newWs.id}`);
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const currentWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) || null;
  const ownedWorkspaces = workspaces.filter((w) => w.is_owner !== false && w.role !== 'collaborator');
  const collaboratedWorkspaces = workspaces.filter((w) => w.is_owner === false || w.role === 'collaborator');

  const displayedWorkspaces = switcherTab === 'owned' ? ownedWorkspaces : collaboratedWorkspaces;

  return (
    <div style={{ position: 'relative' }}>
      <button
        id="workspace-switcher-btn"
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.375rem 0.75rem',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          minWidth: '180px',
          maxWidth: '260px',
        }}
      >
        {loading ? (
          <Loader2 size={14} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
        ) : (
          <FolderKanban size={16} style={{ color: 'var(--accent-amber)' }} />
        )}
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading...' : currentWorkspace ? currentWorkspace.name : 'No Workspace'}
        </span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
      </button>

      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 99 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '0.375rem',
              width: '290px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 100,
              padding: '0.5rem',
            }}
          >
            {/* Owned vs Collaborated Tab Switcher */}
            <div
              style={{
                display: 'flex',
                gap: '0.25rem',
                padding: '0.25rem',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '0.5rem',
              }}
            >
              <button
                onClick={() => setSwitcherTab('owned')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: switcherTab === 'owned' ? 600 : 500,
                  color: switcherTab === 'owned' ? 'var(--accent-amber-hover)' : 'var(--text-secondary)',
                  backgroundColor: switcherTab === 'owned' ? 'var(--bg-card)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <Crown size={12} />
                <span>Owned ({ownedWorkspaces.length})</span>
              </button>
              <button
                onClick={() => setSwitcherTab('collaborated')}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  padding: '0.375rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: switcherTab === 'collaborated' ? 600 : 500,
                  color: switcherTab === 'collaborated' ? 'var(--accent-amber-hover)' : 'var(--text-secondary)',
                  backgroundColor: switcherTab === 'collaborated' ? 'var(--bg-card)' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                <Users size={12} />
                <span>Collaborated ({collaboratedWorkspaces.length})</span>
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <Loader2 size={14} className="animate-spin" />
                <span>Loading workspaces…</span>
              </div>
            ) : displayedWorkspaces.length === 0 ? (
              <div style={{ padding: '0.875rem 0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {switcherTab === 'owned' ? 'No owned workspaces yet.' : 'No collaborated workspaces.'}
              </div>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {displayedWorkspaces.map((ws) => {
                  const isActive = ws.id === activeWorkspaceId;
                  const isHovered = hoveredWsId === ws.id;
                  const canDelete = ws.is_owner !== false && ws.role !== 'collaborator';

                  return (
                    <div
                      key={ws.id}
                      id={`workspace-item-${ws.id}`}
                      onClick={() => handleSelectWorkspace(ws.id)}
                      onMouseEnter={() => setHoveredWsId(ws.id)}
                      onMouseLeave={() => setHoveredWsId(null)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '0.5rem 0.5rem',
                        fontSize: '0.875rem',
                        backgroundColor: isActive ? 'var(--accent-light)' : isHovered ? 'var(--bg-secondary)' : 'transparent',
                        color: isActive ? 'var(--accent-amber-hover)' : 'var(--text-primary)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        position: 'relative',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <FolderKanban size={14} style={{ flexShrink: 0 }} />
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ws.name}
                      </span>

                      {isActive && !isHovered && (
                        <span style={{ fontSize: '0.65rem', color: 'var(--accent-amber)', fontWeight: 700, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                          ACTIVE
                        </span>
                      )}

                      {isHovered && canDelete && (
                        <button
                          onClick={(e) => handlePromptDelete(e, ws)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ef4444',
                            borderRadius: '4px',
                            transition: 'color 0.15s ease',
                            flexShrink: 0,
                          }}
                          title="Delete Workspace"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="editorial-divider" style={{ margin: '0.5rem 0' }} />

            <button
              id="create-workspace-btn"
              onClick={() => {
                setOpen(false);
                setIsDialogOpen(true);
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.375rem 0.5rem',
                fontSize: '0.875rem',
                color: 'var(--accent-amber-hover)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 500,
                borderRadius: 'var(--radius-sm)',
              }}
            >
              <Plus size={14} />
              New Workspace
            </button>
          </div>
        </>
      )}

      <CreateWorkspaceDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleCreateWorkspace}
        loading={createLoading}
      />

      <DeleteWorkspaceModal
        isOpen={isDeleteModalOpen}
        workspaceName={targetDeleteWs?.name || ''}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTargetDeleteWs(null);
        }}
        onConfirm={confirmDeleteWorkspace}
        loading={deleteLoading}
      />
    </div>
  );
};
