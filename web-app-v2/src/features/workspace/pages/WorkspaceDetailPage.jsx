import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspaceDetail } from '../hooks/useWorkspaceDetail';
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
  const { workspaceId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('documents');
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { workspace, isLoading: isWsLoading } = useWorkspaceDetail(workspaceId);
  const { workspaces, createWorkspace, isCreating } = useWorkspaces();
  const { documents, uploadDocument, deleteDocument, retryDocument, isUploading, isDeleting } = useDocuments(workspaceId);
  const { summary, isLoading: isSummaryLoading, generateSummary, isGenerating: isGeneratingSummary } = useSummary(workspaceId);
  const { learningPath, unitContent, isUnitLoading, generateLearningPath, isGenerating: isGeneratingPath } = useLearningPath(workspaceId, selectedUnitId);
  const { messages, sendMessage, isSending, clearHistory } = useRagChat(workspaceId);
  const { collaborators, addCollaborator, removeCollaborator, isAdding, isRemoving } = useCollaborators(workspaceId);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-white font-sans -m-8">
      {/* Workspace Header */}
      <WorkspaceHeader
        workspace={workspace}
        documents={documents}
        collaborators={collaborators}
        onSwitchWorkspace={() => setIsSwitchModalOpen(true)}
      />

      {/* Navigation Tabs */}
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
