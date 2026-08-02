import { workspaceApi } from '../api/workspaceApi';

/**
 * Standardized Workspace React Query Keys & Lazy-Loaded Query Options.
 * staleTime is inherited from global QueryClient default (5 min).
 * Polling executes ONLY while a document is actively processing AND the document tab is visible.
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
  }),

  titles: (userId) => ({
    queryKey: workspaceQueryKeys.titles(userId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaceTitles(signal),
  }),

  detail: (userId, workspaceId) => ({
    queryKey: workspaceQueryKeys.detail(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaceById(workspaceId, signal),
    enabled: !!workspaceId,
  }),

  documents: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.documents(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getDocuments(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    refetchInterval: (query) => {
      // 1. Stop polling completely if tab is inactive or workspace unselected
      if (!workspaceId || !isTabActive) return false;
      // 2. Stop polling if browser tab is hidden/minimized
      if (typeof document !== 'undefined' && document.visibilityState !== 'visible') return false;

      // 3. Check if any document is actively processing
      const docs = query.state.data || [];
      const hasProcessing = docs.some(
        (d) =>
          d.status === 'PROCESSING' ||
          d.status === 'PENDING' ||
          d.status === 'processing' ||
          d.status === 'uploaded' ||
          d.status === 'upload'
      );

      // Adaptive polling: 4s interval while processing, stopped once all ready/failed
      return hasProcessing ? 4000 : false;
    },
  }),

  summary: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.summary(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getSummary(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    retry: false,
  }),

  learningPath: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.learningPath(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getLearningPath(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
    retry: false,
  }),

  unitContent: (userId, workspaceId, unitId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.unitContent(userId, workspaceId, unitId),
    queryFn: ({ signal }) => workspaceApi.getUnitContent(workspaceId, unitId, signal),
    enabled: !!workspaceId && !!unitId && isTabActive,
  }),

  flashcards: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.flashcards(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getFlashcards(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
  }),

  quiz: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.quiz(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getQuiz(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
  }),

  chatHistory: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.chatHistory(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getChatHistory(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
  }),

  collaborators: (userId, workspaceId, isTabActive = true) => ({
    queryKey: workspaceQueryKeys.collaborators(userId, workspaceId),
    queryFn: ({ signal }) => workspaceApi.getCollaborators(workspaceId, signal),
    enabled: !!workspaceId && isTabActive,
  }),
};

