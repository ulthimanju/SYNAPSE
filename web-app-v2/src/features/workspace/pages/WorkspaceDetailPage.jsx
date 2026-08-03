import React, { useState, useEffect } from 'react';
import { useWorkspace } from '../context/WorkspaceContext';
import { useWorkspaces } from '../hooks/useWorkspaces';
import { useDocuments } from '../hooks/useDocuments';
import { useDocumentSSE } from '../hooks/useDocumentSSE';
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
import { WorkspaceListPage } from './WorkspaceListPage';

export const WorkspaceDetailPage = () => {
  // 1. Read single source of truth from Workspace Context (URL-driven)
  const {
    userId,
    workspaceId,
    activeTab,
    currentWorkspace,
    workspaces,
    switchWorkspace,
    setActiveTab,
  } = useWorkspace();

  // 2. Workspace-Scoped UI State (Declared unconditionally at top level)
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Reset UI State when workspaceId changes
  useEffect(() => {
    setSelectedUnitId(null);
    setIsSwitchModalOpen(false);
    setIsCreateModalOpen(false);
  }, [workspaceId]);

  // 3. Declare ALL Custom Hooks unconditionally at top level to enforce React Rules of Hooks
  const { createWorkspace, isCreating } = useWorkspaces();

  const isDocTabActive = !!workspaceId && activeTab === 'documents';
  const isSummaryTabActive = !!workspaceId && activeTab === 'summary';
  const isLpTabActive = !!workspaceId && activeTab === 'learning-path';
  const isChatTabActive = !!workspaceId && activeTab === 'chat';
  // Fix: collaborators should ONLY load on the collaborators tab, not on documents tab
  const isCollabTabActive = !!workspaceId && activeTab === 'collaborators';

  const {
    documents,
    uploadDocument,
    deleteDocument,
    retryDocument,
    isLoading: isDocumentsLoading,
    isFetching: isDocumentsFetching,
    isUploading,
    isDeleting,
  } = useDocuments(workspaceId, isDocTabActive);
  const isDocumentsBusy = isDocTabActive && (isDocumentsLoading || isDocumentsFetching);

  // SSE: real-time document status stream — replaces polling refetchInterval
  useDocumentSSE(userId, workspaceId, isDocTabActive);

  const { summary, isLoading: isSummaryLoading, generateSummary, isGenerating: isGeneratingSummary } = useSummary(
    workspaceId,
    isSummaryTabActive
  );
  const { learningPath, unitContent, isUnitLoading, generateLearningPath, isGenerating: isGeneratingPath } = useLearningPath(
    workspaceId,
    selectedUnitId,
    isLpTabActive
  );
  const { messages, sendMessage, isSending, clearHistory } = useRagChat(
    workspaceId,
    isChatTabActive
  );
  const { collaborators, addCollaborator, removeCollaborator, isAdding, isRemoving } = useCollaborators(
    workspaceId,
    isCollabTabActive
  );

  // 4. Conditional Return ONLY AFTER ALL HOOKS ARE DECLARED
  if (!workspaceId) {
    return <WorkspaceListPage />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f5fa] text-slate-800 font-sans">
      {/* Workspace Header */}
      <WorkspaceHeader
        workspace={currentWorkspace}
        documents={documents}
        collaborators={collaborators}
        isLoading={isDocumentsBusy}
        onSwitchWorkspace={() => setIsSwitchModalOpen(true)}
      />

      {/* Navigation Tabs (Deep Linking via URL query ?tab=...) */}
      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={documents.length}
      />

      {/* Main Tab Content Viewport */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'documents' && (
          <DocumentsTab
            documents={documents}
            onUpload={uploadDocument}
            onDelete={deleteDocument}
            onRetry={retryDocument}
            isLoading={isDocumentsBusy}
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
