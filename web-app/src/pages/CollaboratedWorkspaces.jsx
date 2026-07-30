import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/feedback/EmptyState';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { Users, FolderKanban, ShieldCheck, ArrowRight } from 'lucide-react';

export const CollaboratedWorkspaces = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCollaboratedWorkspaces = async () => {
      setLoading(true);
      try {
        const res = await api.get('/workspaces');
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list)) {
          // Filter strictly for workspaces where user is NOT the owner
          const colabs = list.filter((ws) => ws.is_owner === false || ws.role === 'collaborator');
          setWorkspaces(colabs);
        } else {
          setWorkspaces([]);
        }
      } catch (err) {
        console.error('Failed to fetch collaborated workspaces:', err);
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollaboratedWorkspaces();
  }, []);

  return (
    <WorkspaceLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="font-serif" style={{ fontSize: '2rem', color: 'var(--text-primary)' }}>
              Collaborated Workspaces
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Workspaces shared with you by other environment owners. Read & RAG access enabled.
            </p>
          </div>
        </div>

        {/* Metrics Overview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <Card title="Shared Environments" subtitle="Workspaces shared with you">
            <h2 className="font-mono" style={{ fontSize: '2.5rem', color: 'var(--accent-amber)' }}>
              {loading ? '-' : workspaces.length}
            </h2>
          </Card>
          <Card title="Permission Level" subtitle="Workspace access level">
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={24} style={{ color: 'var(--accent-amber)' }} />
              <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Collaborator (View & RAG)
              </span>
            </div>
          </Card>
        </div>

        {/* Workspace Cards / Empty State */}
        {workspaces.length === 0 ? (
          <EmptyState
            title="No Collaborated Workspaces"
            description="No one has invited you to a workspace environment yet. When workspace owners invite your email address, their workspaces will appear here."
          />
        ) : (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Workspaces Shared With You ({workspaces.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => navigate(`/workspaces/${ws.id}`)}
                  className="editorial-card"
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1rem',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FolderKanban size={18} style={{ color: 'var(--accent-amber)' }} />
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                          {ws.name}
                        </h4>
                      </div>
                      <Badge variant="outline" style={{ fontSize: '0.7rem' }}>
                        Collaborator
                      </Badge>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                      Owner ID: <code style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>{ws.owner_id}</code>
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', fontSize: '0.85rem', color: 'var(--accent-amber-hover)', fontWeight: 500 }}>
                    <span>Open Workspace</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
};
