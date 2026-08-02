import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useDocuments } from '../hooks/useDocuments';
import { useSummary } from '../hooks/useSummary';
import { useLearningPath } from '../hooks/useLearningPath';
import { useRagChat } from '../hooks/useRagChat';
import { useCollaborators } from '../hooks/useCollaborators';
import { WorkspaceHeader } from '../components/WorkspaceHeader';
import { WorkspaceTabs } from '../components/WorkspaceTabs';
import { DocumentsTab } from '../components/DocumentsTab';
import { SummaryTab } from '../components/SummaryTab';
import { LearningPathTab } from '../components/LearningPathTab';
import { RagChatTab } from '../components/RagChatTab';
import { CollaboratorsTab } from '../components/CollaboratorsTab';
import { SwitchWorkspaceModal } from '../components/SwitchWorkspaceModal';
import { CreateWorkspaceModal } from '../components/CreateWorkspaceModal';

export const WorkspaceDetailPage = () => {
  // 1. Read single source of truth from Workspace Context (URL-driven)
  const {
    workspaceId,
    activeTab,
    currentWorkspace,
    isWorkspaceLoading,
    workspaces,
    switchWorkspace,
    setActiveTab,
  } = useWorkspace();

  // 2. Workspace-Scoped UI State (Resets on workspace change)
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Rule H: Reset UI State when workspaceId changes
  useEffect(() => {
    setSelectedUnitId(null);
    setIsSwitchModalOpen(false);
    setIsCreateModalOpen(false);
  }, [workspaceId]);

  // 3. Workspace-Scoped Data Fetching Hooks
  const { createWorkspace, isCreating } = useWorkspaces();
  const { documents, uploadDocument, deleteDocument, retryDocument, isUploading, isDeleting } = useDocuments(workspaceId);
  const { summary, isLoading: isSummaryLoading, generateSummary, isGenerating: isGeneratingSummary } = useSummary(workspaceId);
  const { learningPath, unitContent, isUnitLoading, generateLearningPath, isGenerating: isGeneratingPath } = useLearningPath(workspaceId, selectedUnitId);
  const { messages, sendMessage, isSending, clearHistory } = useRagChat(workspaceId);
  const { collaborators, addCollaborator, removeCollaborator, isAdding, isRemoving } = useCollaborators(workspaceId);

  // Fallback sample documents matching screenshot if no documents uploaded yet
  const defaultDocuments = [
    {
      id: 'doc_1',
      filename: 'OPERATING SYSTEM PART-1.pdf',
      file_size: 41.26 * 1024 * 1024,
      status: 'PROCESSED',
      created_at: '2026-07-31T00:00:00Z',
    },
    {
      id: 'doc_2',
      filename: 'OPERATING SYSTEM PART-2.pdf',
      file_size: 37.52 * 1024 * 1024,
      status: 'PROCESSED',
      created_at: '2026-07-31T00:00:00Z',
    },
  ];

  const displayDocuments = documents && documents.length > 0 ? documents : defaultDocuments;

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5fa] text-slate-800 font-sans">
      {/* Workspace Header */}
      <WorkspaceHeader
        workspace={currentWorkspace}
        documents={displayDocuments}
        collaborators={collaborators}
        onSwitchWorkspace={() => setIsSwitchModalOpen(true)}
      />

      {/* Navigation Tabs (Deep Linking via URL query ?tab=...) */}
      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={displayDocuments.length}
      />

      {/* Main Tab Content Viewport */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'documents' && (
          <DocumentsTab
            documents={displayDocuments}
            onUpload={uploadDocument}
            onDelete={deleteDocument}
            onRetry={retryDocument}
            isUploading={isUploading}
            isDeleting={isDeleting}
          />
        )}

        {activeTab === 'summary' && (
          <SummaryTab
            summary={summary}
            isLoading={isSummaryLoading}
            isGenerating={isGeneratingSummary}
            onGenerate={generateSummary}
          />
        )}

        {activeTab === 'learning-path' && (
          <LearningPathTab
            learningPath={learningPath}
            unitContent={unitContent}
            isUnitLoading={isUnitLoading}
            onSelectUnit={setSelectedUnitId}
            onGenerate={generateLearningPath}
            isGenerating={isGeneratingPath}
          />
        )}

        {activeTab === 'chat' && (
          <RagChatTab
            messages={messages}
            onSendMessage={sendMessage}
            isSending={isSending}
            onClearHistory={clearHistory}
          />
        )}

        {activeTab === 'collaborators' && (
          <CollaboratorsTab
            collaborators={collaborators}
            onAddCollaborator={addCollaborator}
            onRemoveCollaborator={removeCollaborator}
            isAdding={isAdding}
            isRemoving={isRemoving}
          />
        )}
      </main>

      {/* Switch Workspace Modal */}
      <SwitchWorkspaceModal
        isOpen={isSwitchModalOpen}
        onClose={() => setIsSwitchModalOpen(false)}
        workspaces={workspaces}
        currentWorkspaceId={workspaceId}
        onOpenCreate={() => setIsCreateModalOpen(true)}
      />

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createWorkspace}
        isCreating={isCreating}
      />
    </div>
  );
};
