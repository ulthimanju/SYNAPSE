import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FolderKanban, Plus, Loader2, Trash2 } from 'lucide-react';
import { useAppStore } from '../../stores/appStore';
import { CreateWorkspaceDialog } from '../workspace/CreateWorkspaceDialog';
import { api } from '../../services/api';

export const WorkspaceSwitcher = () => {
  const [open, setOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [hoveredWsId, setHoveredWsId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { activeWorkspaceId, setActiveWorkspaceId } = useAppStore();
  const navigate = useNavigate();

  const fetchWorkspaceTitles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/workspaces/titles');
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setWorkspaces(list);
      if (list.length > 0 && !activeWorkspaceId) {
        setActiveWorkspaceId(list[0].id);
      }
    } catch (err) {
      console.error('Error loading workspaces for topbar switcher');
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    fetchWorkspaceTitles();
  }, []);

  const handleSelectWorkspace = (wsId) => {
    setActiveWorkspaceId(wsId);
    setOpen(false);
    navigate(`/workspaces/${wsId}`);
  };

  const handleDeleteWorkspace = async (e, ws) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete workspace "${ws.name}"?\nThis will cascade delete all associated documents and data.`)) {
      return;
    }

    setDeletingId(ws.id);
    try {
      await api.delete(`/workspaces/${ws.id}`);
      const updatedList = workspaces.filter((w) => w.id !== ws.id);
      setWorkspaces(updatedList);

      if (ws.id === activeWorkspaceId) {
        if (updatedList.length > 0) {
          const nextWs = updatedList[0];
          setActiveWorkspaceId(nextWs.id);
          navigate(`/workspaces/${nextWs.id}`);
        } else {
          setActiveWorkspaceId(null);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      console.error(`Failed to delete workspace ${ws.name}:`, err);
      alert(`Failed to delete workspace "${ws.name}". Please try again.`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreateWorkspace = async (formData) => {
    setCreateLoading(true);
    try {
      const res = await api.post('/workspaces', formData);
      const newWs = res?.data || res;
      if (newWs?.id) {
        const newTitle = { id: newWs.id, name: newWs.name };
        setWorkspaces((prev) => [newTitle, ...prev]);
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
          {/* Click-away overlay */}
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
              width: '280px',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              boxShadow: 'var(--shadow-md)',
              zIndex: 100,
              padding: '0.5rem',
            }}
          >
            <div style={{
              fontSize: '0.70rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              padding: '0.25rem 0.5rem 0.375rem',
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.08em',
            }}>
              WORKSPACES ({workspaces.length})
            </div>

            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <Loader2 size={14} className="animate-spin" />
                <span>Loading workspaces…</span>
              </div>
            ) : workspaces.length === 0 ? (
              <div style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                No workspaces yet. Create one below.
              </div>
            ) : (
              <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                {workspaces.map((ws) => {
                  const isActive = ws.id === activeWorkspaceId;
                  const isHovered = hoveredWsId === ws.id;
                  const isDeleting = deletingId === ws.id;

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

                      {isHovered && (
                        <button
                          onClick={(e) => handleDeleteWorkspace(e, ws)}
                          disabled={isDeleting}
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
                          {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={14} />}
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
    </div>
  );
};
