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
import { Button } from '../components/common/Button';
import { useAppStore } from '../stores/appStore';
import { api } from '../services/api';
import { FileText, Sparkles, BookOpen, MessageSquare } from 'lucide-react';

export const WorkspaceDetail = () => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { activeWorkspaceId, setActiveWorkspaceId } = useAppStore();

  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([]);
  const [hasNoWorkspaces, setHasNoWorkspaces] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState({}); // { [filename]: 'uploading'|'done'|'error' }
  const [summary, setSummary] = useState(null);
  const [learningPath, setLearningPath] = useState(null);
  const [activeJobId, setActiveJobId] = useState(null);
  const [notice, setNotice] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const checkWorkspaceExists = async () => {
    try {
      const res = await api.get('/workspaces/titles');
      const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      if (list.length === 0) {
        setHasNoWorkspaces(true);
      } else {
        setHasNoWorkspaces(false);
        const found = list.find((w) => w.id === workspaceId);
        if (found) {
          setActiveWorkspaceId(found.id);
        } else {
          // Redirect to first workspace if current URL workspace ID is invalid
          const targetId = list[0].id;
          setActiveWorkspaceId(targetId);
          navigate(`/workspaces/${targetId}`, { replace: true });
        }
      }
    } catch (err) {
      console.log('Error listing workspaces:', err);
      setHasNoWorkspaces(true);
    }
  };

  const fetchDocuments = async () => {
    if (!workspaceId) return;
    try {
      const res = await api.get(`/workspaces/${workspaceId}/documents`);
      const docs = Array.isArray(res) ? res : res?.data;
      if (Array.isArray(docs)) setDocuments(docs);
    } catch (err) {
      console.log('No documents loaded yet');
    }
  };

  const fetchSummary = async () => {
    if (!workspaceId) return;
    try {
      const res = await api.get(`/workspaces/${workspaceId}/summary`);
      const data = res?.data || res;
      if (data && data.title) setSummary(data);
    } catch (err) {
      console.log('No cached summary found yet');
    }
  };

  const fetchLearningPath = async () => {
    if (!workspaceId) return;
    try {
      const res = await api.get(`/workspaces/${workspaceId}/learning-path`);
      const data = res?.data || res;
      if (data && data.title) setLearningPath(data);
    } catch (err) {
      console.log('No cached learning path found yet');
    }
  };

  useEffect(() => {
    checkWorkspaceExists();
    if (workspaceId) {
      fetchDocuments();
      fetchSummary();
      fetchLearningPath();
    }
  }, [workspaceId]);

  // Automatic polling while documents are in uploaded or processing states
  useEffect(() => {
    const isProcessing = documents.some((d) => d.status === 'uploaded' || d.status === 'processing');
    if (!isProcessing) return;

    const timer = setInterval(() => {
      fetchDocuments();
    }, 2500);

    return () => clearInterval(timer);
  }, [documents, workspaceId]);

  const handleCreateWorkspace = async (formData) => {
    setCreateLoading(true);
    try {
      const res = await api.post('/workspaces', formData);
      const newWs = res?.data || res;
      if (newWs && newWs.id) {
        setHasNoWorkspaces(false);
        setActiveWorkspaceId(newWs.id);
        navigate(`/workspaces/${newWs.id}`, { replace: true });
      }
      setIsCreateDialogOpen(false);
    } catch (err) {
      console.error('Failed to create workspace:', err);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleQueueSummary = async () => {
    setNotice(null);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/summary`);
      const data = res?.data || res;
      if (data?.job_id) {
        setActiveJobId(data.job_id);
        setNotice('Queued background summary generation (202 Accepted). You may continue navigating.');
      }
    } catch (err) {
      setErrorMsg('Failed to queue summary generation job.');
    }
  };

  const handleQueueLearningPath = async () => {
    setNotice(null);
    try {
      const res = await api.post(`/workspaces/${workspaceId}/learning-path`);
      const data = res?.data || res;
      if (data?.job_id) {
        setActiveJobId(data.job_id);
        setNotice('Queued background learning path generation (202 Accepted).');
      }
    } catch (err) {
      setErrorMsg('Failed to queue learning path generation job.');
    }
  };

  const handleJobComplete = () => {
    setActiveJobId(null);
    setNotice('Background AI Generation Job completed successfully!');
    fetchSummary();
    fetchLearningPath();
  };

  // Upload an array of files concurrently; track per-file status
  const handleUpload = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    setNotice(null);

    // Mark all files as 'uploading'
    const initialStatuses = {};
    files.forEach((f) => { initialStatuses[f.name] = 'uploading'; });
    setUploadStatuses(initialStatuses);

    // Upload all files concurrently
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

    // Process results
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
        console.error(`Upload failed for ${fileName}:`, result.reason);
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

    // Clear statuses and auto-hide notice message banner after 5 seconds
    setTimeout(() => {
      setUploadStatuses({});
      setNotice(null);
    }, 5000);
  };

  const handleDeleteDocument = async (docId) => {
    if (!window.confirm('Delete this document and remove file from MinIO storage?')) return;
    try {
      await api.delete(`/documents/${docId}`);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    } catch (err) {
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
    }
  };

  const handleRetryDocument = async (doc) => {
    try {
      await api.post(`/workspaces/${workspaceId}/documents/${doc.id}/retry`);
      setDocuments((prev) =>
        prev.map((d) => (d.id === doc.id ? { ...d, status: 'processing', processing_stage: 'parse' } : d))
      );
    } catch (err) {
      console.error(`Failed to retry document ${doc.filename}:`, err);
      alert(`Failed to restart processing for document "${doc.filename}". Please try again.`);
    }
  };

  const tabs = [
    { id: 'documents', label: 'Documents & Ingestion', icon: FileText },
    { id: 'summary', label: 'AI Summary', icon: Sparkles },
    { id: 'learning', label: 'Learning Path', icon: BookOpen },
    { id: 'rag', label: 'RAG Assistant', icon: MessageSquare },
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

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', overflowX: 'auto' }}>
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

        {notice && <Alert type="info" message={notice} />}
        {errorMsg && <Alert type="info" message={errorMsg} />}

        {activeJobId && (
          <JobPolling
            workspaceId={workspaceId}
            jobId={activeJobId}
            onComplete={handleJobComplete}
          />
        )}

        {/* Tab Content */}
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
              {/* Left Column: Document List with Scrollable Overflow */}
              <div
                style={{
                  maxHeight: 'calc(100vh - 150px)',
                  overflowY: 'auto',
                  paddingRight: '0.5rem',
                }}
              >
                <DocumentList documents={documents} onDelete={handleDeleteDocument} onRetry={handleRetryDocument} />
              </div>

              {/* Right Column: Sticky Upload Zone */}
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
                onRegenerate={handleQueueSummary}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <WorkspaceSummaryPlaceholder />
                <div style={{ marginTop: '1rem' }}>
                  <Button onClick={handleQueueSummary}>
                    <Sparkles size={16} />
                    <span>Generate Executive Summary</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'learning' && (
          <div>
            {learningPath ? (
              <LearningPathView
                learningPath={learningPath}
                workspaceId={workspaceId}
                onRegenerate={handleQueueLearningPath}
              />
            ) : (
              <LearningPathPlaceholder onGenerate={handleQueueLearningPath} />
            )}
          </div>
        )}

        {activeTab === 'rag' && <ChatPanel workspaceId={workspaceId} />}
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
