import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { Card } from '../components/common/Card';
import { EmptyState } from '../components/feedback/EmptyState';
import { Button } from '../components/common/Button';
import { api } from '../services/api';
import { Plus, FolderPlus } from 'lucide-react';

export const Dashboard = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      setLoading(true);
      try {
        const res = await api.get('/workspaces');
        if (res?.data && Array.isArray(res.data)) {
          setWorkspaces(res.data);
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

  const totalWorkspaces = workspaces.length;
  const totalDocuments = workspaces.reduce((acc, ws) => acc + (ws.document_count || 0), 0);

  return (
    <WorkspaceLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem' }}>Dashboard Overview</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome to Synapse workspace intelligence hub</p>
          </div>
          <Button onClick={() => navigate('/workspaces')}>
            <Plus size={16} /> Manage Workspaces
          </Button>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
          <Card title="Active Workspaces" subtitle="Managed environments">
            <h2 className="font-mono" style={{ fontSize: '2.5rem', color: 'var(--accent-amber)' }}>
              {loading ? '-' : totalWorkspaces}
            </h2>
          </Card>
          <Card title="Parsed Documents" subtitle="Vector indexed items">
            <h2 className="font-mono" style={{ fontSize: '2.5rem', color: 'var(--accent-amber)' }}>
              {loading ? '-' : totalDocuments}
            </h2>
          </Card>
          <Card title="RAG Queries" subtitle="Total session queries">
            <h2 className="font-mono" style={{ fontSize: '2.5rem', color: 'var(--accent-amber)' }}>
              {loading ? '-' : 0}
            </h2>
          </Card>
        </div>

        {/* Empty State / Active Workspaces Section */}
        {workspaces.length === 0 ? (
          <EmptyState
            title="No Active Workspaces"
            description="You have not created any knowledge workspaces yet. Create your first workspace to upload documents and generate AI learning paths."
            actionText="Create Your First Workspace"
            onAction={() => navigate('/workspaces')}
          />
        ) : (
          <div>
            <h3 className="font-serif" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Your Workspaces ({workspaces.length})
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {workspaces.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => navigate(`/workspaces/${ws.id}`)}
                  className="editorial-card"
                  style={{ padding: '1.25rem', cursor: 'pointer' }}
                >
                  <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{ws.name}</h4>
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
