import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { Plus, Users, Crown, FolderKanban } from 'lucide-react';

export const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/workspaces');
        const list = res?.data?.data || res?.data || [];
        if (Array.isArray(list)) {
          setWorkspaces(list);
        } else {
          setWorkspaces([]);
        }
      } catch (err) {
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  const ownedWorkspaces = workspaces.filter((ws) => ws.is_owner !== false && ws.role !== 'collaborator');
  const collaboratedWorkspaces = workspaces.filter((ws) => ws.is_owner === false || ws.role === 'collaborator');

  return (
    <WorkspaceLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome to Synapse workspace intelligence hub</p>
          </div>
          <Button onClick={() => navigate(ownedWorkspaces.length ? `/workspaces/${ownedWorkspaces[0].id}` : '/workspaces')}>
            <Plus size={16} /> Manage Workspaces
          </Button>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <Card title="Owned Workspaces" subtitle="Environments you created">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Crown size={24} style={{ color: 'var(--accent-amber)' }} />
              <h2 className="font-mono" style={{ fontSize: '2.5rem', color: 'var(--accent-amber)', margin: 0 }}>
                {loading ? '-' : ownedWorkspaces.length}
              </h2>
            </div>
          </Card>
          <Card title="Collaborated Workspaces" subtitle="Shared with your email">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users size={24} style={{ color: 'var(--accent-amber-hover)' }} />
              <h2 className="font-mono" style={{ fontSize: '2.5rem', color: 'var(--accent-amber-hover)', margin: 0 }}>
                {loading ? '-' : collaboratedWorkspaces.length}
              </h2>
            </div>
          </Card>
        </div>

        {/* Owned Workspaces Section */}
        {ownedWorkspaces.length === 0 ? (
          <EmptyState
            title="No Owned Workspaces"
            description="You have not created any knowledge workspaces yet. Create your first workspace to upload documents and generate AI learning paths."
            actionText="Create Your First Workspace"
            onAction={() => navigate('/workspaces')}
          />
        ) : (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Owned Workspaces ({ownedWorkspaces.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {ownedWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => navigate(`/workspaces/${ws.id}`)}
                  className="editorial-card"
                  style={{ padding: '1.25rem', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{ws.name}</h4>
                    <Badge variant="accent" style={{ fontSize: '0.7rem' }}>Owner</Badge>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    {ws.description || 'No description provided.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </WorkspaceLayout>
  );
};
