import { workspaceApi } from '../api/workspaceApi';

/**
 * Standardized Workspace React Query Keys & Lazy-Loaded Query Options.
 * Rule: Tab-level lazy loading — queries are enabled ONLY when their corresponding tab is active.
 * High staleTime (5 mins) guarantees instant loading from cache on tab switches.
 */
export const workspaceQueryKeys = {
  all: (userId) => ['workspaces', userId || 'session'],
  titles: (userId) => ['workspaces', userId || 'session', 'titles'],
  detail: (userId, workspaceId) => ['workspace', userId || 'session', workspaceId || 'none'],
  documents: (userId, workspaceId) => ['documents', userId || 'session', workspaceId || 'none'],
  summary: (userId, workspaceId) => ['summary', userId || 'session', workspaceId || 'none'],
  learningPath: (userId, workspaceId) => ['learning-path', userId || 'session', workspaceId || 'none'],
  unitContent: (userId, workspaceId, unitId) => ['unit', userId || 'session', workspaceId || 'none', unitId || 'none'],
  flashcards: (userId, workspaceId) => ['flashcards', userId || 'session', workspaceId || 'none'],
  quiz: (userId, workspaceId) => ['quiz', userId || 'session', workspaceId || 'none'],
  chatHistory: (userId, workspaceId) => ['chat-history', userId || 'session', workspaceId || 'none'],
  collaborators: (userId, workspaceId) => ['collaborators', userId || 'session', workspaceId || 'none'],
};

export const workspaceQueries = {
  list: (userId) => ({
    queryKey: workspaceQueryKeys.all(userId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaces(signal),
    staleTime: 5 * 60 * 1000,
  }),

  titles: (userId) => ({
    queryKey: workspaceQueryKeys.titles(userId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaceTitles(signal),
    staleTime: 5 * 60 * 1000,
  }),

  detail: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.detail(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaceById(workspaceId, signal),
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000,
  }),

  documents: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.documents(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getDocuments(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    staleTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      if (!workspaceId || !isTabActive) return false;
      const docs = query.state.data || [];
      const hasProcessing = docs.some((d) => d.status === 'PROCESSING' || d.status === 'PENDING' || d.status === 'processing');
      return hasProcessing ? 3000 : false;
    },
  }),

  summary: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.summary(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getSummary(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    staleTime: 5 * 60 * 1000,
    retry: false,
  }),

  learningPath: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.learningPath(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getLearningPath(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    staleTime: 5 * 60 * 1000,
    retry: false,
  }),

  unitContent: (userId, workspaceId, unitId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.unitContent(userId, workspaceId, unitId),
    queryFn: ({ signal }) => workspaceApi.getUnitContent(workspaceId, unitId, signal),
    enabled: !!workspaceId && !!unitId && isTabActive,
    staleTime: 5 * 60 * 1000,
  }),

  flashcards: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.flashcards(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getFlashcards(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    staleTime: 5 * 60 * 1000,
  }),

  quiz: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.quiz(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getQuiz(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    staleTime: 5 * 60 * 1000,
  }),

  chatHistory: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.chatHistory(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getChatHistory(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    staleTime: 5 * 60 * 1000,
  }),

  collaborators: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.collaborators(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getCollaborators(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    staleTime: 5 * 60 * 1000,
  }),
};
