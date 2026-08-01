import { workspaceApi } from '../api/workspaceApi';

export const workspaceQueryKeys = {
  all: ['workspaces'],
  titles: ['workspaces', 'titles'],
  detail: (id) => ['workspace', id],
  documents: (id) => ['workspace', id, 'documents'],
  summary: (id) => ['workspace', id, 'summary'],
  learningPath: (id) => ['workspace', id, 'learningPath'],
  unitContent: (id, unitId) => ['workspace', id, 'unit', unitId],
  chatHistory: (id) => ['workspace', id, 'chatHistory'],
  collaborators: (id) => ['workspace', id, 'collaborators'],
};

export const workspaceQueries = {
  list: () => ({
    queryKey: workspaceQueryKeys.all,
    queryFn: workspaceApi.getWorkspaces,
    staleTime: 60 * 1000,
  }),

  titles: () => ({
    queryKey: workspaceQueryKeys.titles,
    queryFn: workspaceApi.getWorkspaceTitles,
    staleTime: 60 * 1000,
  }),

  detail: (id) => ({
    queryKey: workspaceQueryKeys.detail(id),
    queryFn: () => workspaceApi.getWorkspaceById(id),
    enabled: !!id,
  }),

  documents: (id) => ({
    queryKey: workspaceQueryKeys.documents(id),
    queryFn: () => workspaceApi.getDocuments(id),
    enabled: !!id,
    refetchInterval: (query) => {
      // Auto refetch every 3s if any document is processing
      const docs = query.state.data || [];
      const hasProcessing = docs.some((d) => d.status === 'PROCESSING' || d.status === 'PENDING');
      return hasProcessing ? 3000 : false;
    },
  }),

  summary: (id) => ({
    queryKey: workspaceQueryKeys.summary(id),
    queryFn: () => workspaceApi.getSummary(id),
    enabled: !!id,
    retry: false,
  }),

  learningPath: (id) => ({
    queryKey: workspaceQueryKeys.learningPath(id),
    queryFn: () => workspaceApi.getLearningPath(id),
    enabled: !!id,
    retry: false,
  }),

  unitContent: (id, unitId) => ({
    queryKey: workspaceQueryKeys.unitContent(id, unitId),
    queryFn: () => workspaceApi.getUnitContent(id, unitId),
    enabled: !!id && !!unitId,
  }),

  chatHistory: (id) => ({
    queryKey: workspaceQueryKeys.chatHistory(id),
    queryFn: () => workspaceApi.getChatHistory(id),
    enabled: !!id,
  }),

  collaborators: (id) => ({
    queryKey: workspaceQueryKeys.collaborators(id),
    queryFn: () => workspaceApi.getCollaborators(id),
    enabled: !!id,
  }),
};
