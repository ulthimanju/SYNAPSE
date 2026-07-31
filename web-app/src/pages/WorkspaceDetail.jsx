import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkspaceLayout } from '../layouts/WorkspaceLayout';
import { UploadZone } from '../components/documents/UploadZone';
import { DocumentList } from '../components/documents/DocumentList';
import { Alert } from '../components/feedback/Alert';
import { EmptyState } from '../components/feedback/EmptyState';
import { CreateWorkspaceDialog } from '../components/workspace/CreateWorkspaceDialog';
import { SummaryCard } from '../components/summary/SummaryCard';
import { LearningPathView } from '../components/learning-path/LearningPathView';
import { ChatPanel } from '../components/rag-chat/ChatPanel';
import { JobPolling } from '../components/jobs/JobPolling';
import { WorkspaceSummaryPlaceholder } from '../components/ai/WorkspaceSummaryPlaceholder';
import { LearningPathPlaceholder } from '../components/ai/LearningPathPlaceholder';
import { NotAvailablePlaceholder } from '../components/common/NotAvailablePlaceholder';
import { CollaboratorList } from '../components/workspace/CollaboratorList';
import { Button } from '../components/common/Button';
import { useAppStore } from '../stores/appStore';
import { api } from '../services/api';
import { FileText, Sparkles, BookOpen, MessageSquare, Users } from 'lucide-react';

export const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { activeWorkspaceId, setActiveWorkspaceId, sidebarOpen } = useAppStore();

  const [activeTab, setActiveTab] = useState('documents');
  const [workspaceInfo, setWorkspaceInfo] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [hasNoWorkspaces, setHasNoWorkspaces] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState({});
  const [summary, setSummary] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const isOwner = workspaceInfo?.is_owner ?? true;

  const checkWorkspaceExists = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}`);
      if (res?.data?.data) {
        setWorkspaceInfo(res.data.data);
      }
      setHasNoWorkspaces(false);
      if (activeWorkspaceId !== workspaceId) {
        setActiveWorkspaceId(workspaceId);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 403) {
        try {
          const listRes = await api.get('/workspaces/titles');
          const workspaces = listRes?.data?.data || [];
          if (workspaces.length === 0) {
            setHasNoWorkspaces(true);
          } else {
            setHasNoWorkspaces(false);
            const firstWs = workspaces[0];
            setActiveWorkspaceId(firstWs.id);
            navigate(`/workspaces/${firstWs.id}`, { replace: true });
          }
        } catch (lErr) {
          console.error('Failed to list workspaces fallback:', lErr);
          setHasNoWorkspaces(true);
        }
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/documents`);
      const docs = res?.data?.data || res?.data || [];
      setDocuments(docs);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    }
  };

  const fetchSummary = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/summary`);
      setSummary(res?.data?.data || res?.data || null);
    } catch (err) {
      setSummary(null);
    }
  };

  const fetchLearningPath = async () => {
    try {
      const res = await api.get(`/workspaces/${workspaceId}/learning-path`);
      setLearningPath(res?.data?.data || res?.data || null);
    } catch (err) {
      setLearningPath(null);
    }
  };

  // Optimization 1: On workspace select, fetch ONLY workspace info & documents (default tab)
  useEffect(() => {
    if (workspaceId) {
      checkWorkspaceExists();
      fetchDocuments();
      setSummary(null);
      setLearningPath(null);
    }
  }, [workspaceId]);

  // Optimization 1 Lazy Loading: Fetch Summary or Learning Path ONLY when user switches to those tabs
  useEffect(() => {
    if (workspaceId && activeTab === 'summary' && !summary) {
      fetchSummary();
    }
    if (workspaceId && activeTab === 'learning' && !learningPath) {
      fetchLearningPath();
    }
  }, [workspaceId, activeTab, summary, learningPath]);

  const handleQueueSummary = async () => {
    if (!isOwner) return;
    setNotice(null);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/summary`);
      const data = res?.data || res;
      if (data?.job_id) {
        setActiveJobId(data.job_id);
        setNotice('Queued background summary generation (202 Accepted). You may continue navigating.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to queue summary generation job.');
    }
  };

  const handleQueueLearningPath = async () => {
    if (!isOwner) return;
    setNotice(null);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/learning-path`);
      const data = res?.data || res;
      if (data?.job_id) {
        setActiveJobId(data.job_id);
        setNotice('Queued background learning path generation (202 Accepted).');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to queue learning path generation job.');
    }
  };

  const handleJobComplete = () => {
    setActiveJobId(null);
    setNotice('Background AI Generation Job completed successfully!');
    if (activeTab === 'summary') fetchSummary();
    if (activeTab === 'learning') fetchLearningPath();
  };

  const handleUpload = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    setNotice(null);

    const initialStatuses = {};
    files.forEach((f) => { initialStatuses[f.name] = 'uploading'; });
    setUploadStatuses(initialStatuses);

    const results = await Promise.allSettled(
      files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await api.post(`/workspaces/${workspaceId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { file, data: res?.data || res };
      })
    );

    const newStatuses = {};
    let successCount = 0;
    let failCount = 0;

    results.forEach((result, i) => {
      const fileName = files[i].name;
      if (result.status === 'fulfilled' && result.value?.data) {
        newStatuses[fileName] = 'done';
        successCount++;
        setDocuments((prev) => [result.value.data, ...prev]);
      } else {
        newStatuses[fileName] = 'error';
        failCount++;
      }
    });

    setUploadStatuses(newStatuses);
    setUploading(false);

    if (successCount > 0 && failCount === 0) {
      setNotice(`Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}. Processing in background.`);
    } else if (successCount > 0 && failCount > 0) {
      setNotice(`${successCount} uploaded, ${failCount} failed. Check highlighted files.`);
    } else {
      setNotice(`All ${failCount} uploads failed. Check file format and server state.`);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/workspaces/${workspaceId}/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId && d._id !== docId));
      setNotice('Document deleted successfully.');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const handleRetryDocument = async (docId) => {
    try {
      setNotice(`Retrying document processing for ${docId}...`);
      await api.post(`/workspaces/${workspaceId}/documents/${docId}/retry`);
      fetchDocuments();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to retry document processing.');
    }
  };

  const handleCreateWorkspace = async (name) => {
    setCreateLoading(true);
    try {
      const res = await api.post('/workspaces', { name });
      const newWs = res?.data?.data || res?.data;
      if (newWs?.id) {
        setIsCreateDialogOpen(false);
        setActiveWorkspaceId(newWs.id);
        navigate(`/workspaces/${newWs.id}`);
      }
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const tabs = [
    { id: 'documents', label: 'Documents & Ingestion', icon: FileText },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'learning', label: 'Learning Path', icon: BookOpen },
    { id: 'rag', label: 'RAG Assistant', icon: MessageSquare },
    { id: 'collaborators', label: 'Collaborators', icon: Users },
  ];

  if (hasNoWorkspaces) {
    return (
      <WorkspaceLayout>
        <EmptyState
          title="No Workspaces Available"
          description="You do not have any active knowledge workspaces. Click below or use the topbar menu to create your first workspace environment."
          actionText="Create Workspace"
          onAction={() => setIsCreateDialogOpen(true)}
        />
        <CreateWorkspaceDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateWorkspace}
          loading={createLoading}
        />
      </WorkspaceLayout>
    );
  }

  return (
    <WorkspaceLayout>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div
          style={{
            position: 'fixed',
            top: '56px',
            left: sidebarOpen ? '240px' : 0,
            right: 0,
            zIndex: 85,
            backgroundColor: 'var(--bg-primary)',
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid var(--border-color)',
            padding: '0.625rem 2rem',
            overflowX: 'auto',
            transition: 'left 0.2s ease',
          }}
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.5rem 0.875rem',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? 'var(--accent-amber-hover)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <div style={{ height: '52px' }} />
        {notice && <Alert type="info" message={notice} />}
        {errorMsg && <Alert type="error" message={errorMsg} />}
        {activeJobId && (
          <JobPolling
            workspaceId={workspaceId}
            jobId={activeJobId}
            onComplete={handleJobComplete}
          />
        )}
        {activeTab === 'documents' && (
          documents.length === 0 ? (
            <div>
              <UploadZone onUpload={handleUpload} loading={uploading} uploadStatuses={uploadStatuses} />
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                alignItems: 'start',
              }}
            >
              <div
                style={{
                  maxHeight: 'calc(100vh - 150px)',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                }}
              >
                <DocumentList documents={documents} onDelete={handleDeleteDocument} onRetry={handleRetryDocument} />
              </div>
              <div
                style={{
                  position: 'sticky',
                  top: '1rem',
                }}
              >
                <UploadZone onUpload={handleUpload} loading={uploading} uploadStatuses={uploadStatuses} />
              </div>
            </div>
          )
        )}
        {activeTab === 'summary' && (
          <div>
            {summary ? (
              <SummaryCard
                summary={summary}
                onRegenerate={isOwner ? handleQueueSummary : undefined}
              />
            ) : isOwner ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <WorkspaceSummaryPlaceholder />
                <div style={{ marginTop: '1rem' }}>
                  <Button onClick={handleQueueSummary}>
                    <Sparkles size={16} />
                    <span>Generate Executive Summary</span>
                  </Button>
                </div>
              </div>
            ) : (
              <NotAvailablePlaceholder
                title="Not yet Available"
                description="The workspace owner has not generated an Executive Summary for this workspace yet."
              />
            )}
          </div>
        )}
        {activeTab === 'learning' && (
          <div>
            {learningPath ? (
              <LearningPathView
                learningPath={learningPath}
                workspaceId={workspaceId}
                onRegenerate={isOwner ? handleQueueLearningPath : undefined}
              />
            ) : isOwner ? (
              <LearningPathPlaceholder onGenerate={handleQueueLearningPath} />
            ) : (
              <NotAvailablePlaceholder
                title="Not yet Available"
                description="The workspace owner has not generated a Learning Path for this workspace yet."
              />
            )}
          </div>
        )}
        {activeTab === 'rag' && <ChatPanel workspaceId={workspaceId} />}
        {activeTab === 'collaborators' && (
          <CollaboratorList workspaceId={workspaceId} isOwner={isOwner} />
        )}
      </div>
      <CreateWorkspaceDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSubmit={handleCreateWorkspace}
        loading={createLoading}
      />
    </WorkspaceLayout>
  );
};
