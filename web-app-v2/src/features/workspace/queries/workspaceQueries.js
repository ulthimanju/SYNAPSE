import { workspaceApi } from '../api/workspaceApi';

/**
 * Standardized Workspace React Query Keys & Scoped Query Options.
 * Rule 1: Every query key MUST be uniquely isolated using BOTH userId and workspaceId.
 * No generic or incomplete query keys exist.
 */
export const workspaceQueryKeys = {
  all: (userId) => ['workspaces', userId || 'anonymous'],
  titles: (userId) => ['workspaces', userId || 'anonymous', 'titles'],
  detail: (userId, workspaceId) => ['workspace', userId || 'anonymous', workspaceId || 'none'],
  documents: (userId, workspaceId) => ['documents', userId || 'anonymous', workspaceId || 'none'],
  summary: (userId, workspaceId) => ['summary', userId || 'anonymous', workspaceId || 'none'],
  learningPath: (userId, workspaceId) => ['learning-path', userId || 'anonymous', workspaceId || 'none'],
  unitContent: (userId, workspaceId, unitId) => ['unit', userId || 'anonymous', workspaceId || 'none', unitId || 'none'],
  flashcards: (userId, workspaceId) => ['flashcards', userId || 'anonymous', workspaceId || 'none'],
  quiz: (userId, workspaceId) => ['quiz', userId || 'anonymous', workspaceId || 'none'],
  chatHistory: (userId, workspaceId) => ['chat-history', userId || 'anonymous', workspaceId || 'none'],
  collaborators: (userId, workspaceId) => ['collaborators', userId || 'anonymous', workspaceId || 'none'],
};

export const workspaceQueries = {
  list: (userId) => ({
    queryKey: workspaceQueryKeys.all(userId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaces(signal),
    staleTime: 60 * 1000,
  }),

  titles: (userId) => ({
    queryKey: workspaceQueryKeys.titles(userId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaceTitles(signal),
    staleTime: 60 * 1000,
  }),

  detail: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.detail(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaceById(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
  }),

  documents: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.documents(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getDocuments(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
    refetchInterval: (query) => {
      if (!workspaceId) return false;
      const docs = query.state.data || [];
      const hasProcessing = docs.some((d) => d.status === 'PROCESSING' || d.status === 'PENDING');
      return hasProcessing ? 3000 : false;
    },
  }),

  summary: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.summary(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getSummary(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
    retry: false,
  }),

  learningPath: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.learningPath(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getLearningPath(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
    retry: false,
  }),

  unitContent: (userId, workspaceId, unitId) => ({
    queryKey: workspaceQueryKeys.unitContent(userId, workspaceId, unitId),
    queryFn: ({ signal }) => workspaceApi.getUnitContent(workspaceId, unitId, signal),
    enabled: !!userId && !!workspaceId && !!unitId,
  }),

  flashcards: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.flashcards(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getFlashcards(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
  }),

  quiz: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.quiz(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getQuiz(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
  }),

  chatHistory: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.chatHistory(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getChatHistory(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
  }),

  collaborators: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.collaborators(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getCollaborators(workspaceId, signal),
    enabled: !!userId && !!workspaceId,
  }),
};
