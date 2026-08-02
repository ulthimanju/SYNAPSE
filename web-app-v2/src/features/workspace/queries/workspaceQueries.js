import { workspaceApi } from '../api/workspaceApi';

/**
 * Standardized Workspace React Query Keys & Scoped Query Options.
 * Rule D: Every query key is strictly scoped by workspaceId.
 */
export const workspaceQueryKeys = {
  all: ['workspaces'],
  titles: ['workspaces', 'titles'],
  detail: (workspaceId) => ['workspace', workspaceId],
  documents: (workspaceId) => ['documents', workspaceId],
  summary: (workspaceId) => ['summary', workspaceId],
  learningPath: (workspaceId) => ['learning-path', workspaceId],
  unitContent: (workspaceId, unitId) => ['unit', workspaceId, unitId],
  flashcards: (workspaceId) => ['flashcards', workspaceId],
  quiz: (workspaceId) => ['quiz', workspaceId],
  chatHistory: (workspaceId) => ['chat-history', workspaceId],
  collaborators: (workspaceId) => ['collaborators', workspaceId],
};

export const workspaceQueries = {
  list: () => ({
    queryKey: workspaceQueryKeys.all,
    queryFn: ({ signal }) => workspaceApi.getWorkspaces(signal),
    staleTime: 60 * 1000,
  }),

  titles: () => ({
    queryKey: workspaceQueryKeys.titles,
    queryFn: ({ signal }) => workspaceApi.getWorkspaceTitles(signal),
    staleTime: 60 * 1000,
  }),

  detail: (workspaceId) => ({
    queryKey: workspaceQueryKeys.detail(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getWorkspaceById(workspaceId, signal),
    enabled: !!workspaceId,
  }),

  documents: (workspaceId) => ({
    queryKey: workspaceQueryKeys.documents(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getDocuments(workspaceId, signal),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      const docs = query.state.data || [];
      const hasProcessing = docs.some((d) => d.status === 'PROCESSING' || d.status === 'PENDING');
      return hasProcessing ? 3000 : false;
    },
  }),

  summary: (workspaceId) => ({
    queryKey: workspaceQueryKeys.summary(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getSummary(workspaceId, signal),
    enabled: !!workspaceId,
    retry: false,
  }),

  learningPath: (workspaceId) => ({
    queryKey: workspaceQueryKeys.learningPath(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getLearningPath(workspaceId, signal),
    enabled: !!workspaceId,
    retry: false,
  }),

  unitContent: (workspaceId, unitId) => ({
    queryKey: workspaceQueryKeys.unitContent(workspaceId, unitId),
    queryFn: ({ signal }) => workspaceApi.getUnitContent(workspaceId, unitId, signal),
    enabled: !!workspaceId && !!unitId,
  }),

  flashcards: (workspaceId) => ({
    queryKey: workspaceQueryKeys.flashcards(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getFlashcards(workspaceId, signal),
    enabled: !!workspaceId,
  }),

  quiz: (workspaceId) => ({
    queryKey: workspaceQueryKeys.quiz(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getQuiz(workspaceId, signal),
    enabled: !!workspaceId,
  }),

  chatHistory: (workspaceId) => ({
    queryKey: workspaceQueryKeys.chatHistory(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getChatHistory(workspaceId, signal),
    enabled: !!workspaceId,
  }),

  collaborators: (workspaceId) => ({
    queryKey: workspaceQueryKeys.collaborators(workspaceId),
    queryFn: ({ signal }) => workspaceApi.getCollaborators(workspaceId, signal),
    enabled: !!workspaceId,
  }),
};
