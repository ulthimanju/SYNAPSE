import { axiosInstance } from '../../../services/axios/axiosInstance';

export const workspaceApi = {
  // Workspaces CRUD
  getWorkspaces: async () => {
    const res = await axiosInstance.get('/workspaces');
    return res?.data?.data || res?.data || [];
  },

  getWorkspaceTitles: async () => {
    const res = await axiosInstance.get('/workspaces/titles');
    return res?.data?.data || res?.data || [];
  },

  getWorkspaceById: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}`);
    return res?.data?.data || res?.data;
  },

  createWorkspace: async (payload) => {
    const res = await axiosInstance.post('/workspaces', payload);
    return res?.data?.data || res?.data;
  },

  updateWorkspace: async (workspaceId, payload) => {
    const res = await axiosInstance.patch(`/workspaces/${workspaceId}`, payload);
    return res?.data?.data || res?.data;
  },

  deleteWorkspace: async (workspaceId) => {
    const res = await axiosInstance.delete(`/workspaces/${workspaceId}`);
    return res?.data;
  },

  // Documents Ingestion & Processing
  getDocuments: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/documents`);
    return res?.data?.data || res?.data || [];
  },

  uploadDocument: async (workspaceId, formData) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data?.data || res?.data;
  },

  deleteDocument: async (documentId) => {
    const res = await axiosInstance.delete(`/documents/${documentId}`);
    return res?.data;
  },

  retryDocument: async (workspaceId, documentId) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/documents/${documentId}/retry`);
    return res?.data?.data || res?.data;
  },

  // Executive Summary & Job Status
  getSummary: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/summary`);
    return res?.data?.data || res?.data;
  },

  generateSummary: async (workspaceId) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/summary`);
    return res?.data?.data || res?.data;
  },

  getJobStatus: async (workspaceId, jobId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/jobs/${jobId}`);
    return res?.data?.data || res?.data;
  },

  // Learning Path, Units, Flashcards & Quizzes
  getLearningPath: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/learning-path`);
    return res?.data?.data || res?.data;
  },

  generateLearningPath: async (workspaceId) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/learning-path`);
    return res?.data?.data || res?.data;
  },

  getUnitContent: async (workspaceId, unitId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/units/${unitId}`);
    return res?.data?.data || res?.data;
  },

  generateFlashcards: async (workspaceId, topic = '') => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/flashcards`, { topic });
    return res?.data?.data || res?.data;
  },

  getFlashcards: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/flashcards`);
    return res?.data?.data || res?.data || [];
  },

  generateQuiz: async (workspaceId, topic = '') => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/quizzes`, { topic });
    return res?.data?.data || res?.data;
  },

  getQuiz: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/quizzes`);
    return res?.data?.data || res?.data;
  },

  // RAG Retrieval & Conversational Assistant
  retrieveContext: async (workspaceId, query, topK = 5) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/retrieve`, { query, top_k: topK });
    return res?.data?.data || res?.data;
  },

  sendChatMessage: async (workspaceId, message) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/chat`, { message });
    return res?.data?.data || res?.data;
  },

  getChatHistory: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/chat/history`);
    return res?.data?.data || res?.data || [];
  },

  clearChatHistory: async (workspaceId) => {
    const res = await axiosInstance.delete(`/workspaces/${workspaceId}/chat/history`);
    return res?.data;
  },

  // Collaborators & Access Control
  getCollaborators: async (workspaceId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/collaborators`);
    return res?.data?.data || res?.data || [];
  },

  getCollaboratorById: async (workspaceId, collaboratorId) => {
    const res = await axiosInstance.get(`/workspaces/${workspaceId}/collaborators/${collaboratorId}`);
    return res?.data?.data || res?.data;
  },

  addCollaborator: async (workspaceId, email, role = 'viewer') => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/collaborators`, { email, role });
    return res?.data?.data || res?.data;
  },

  updateCollaboratorRole: async (workspaceId, collaboratorId, role) => {
    const res = await axiosInstance.patch(`/workspaces/${workspaceId}/collaborators/${collaboratorId}`, { role });
    return res?.data?.data || res?.data;
  },

  removeCollaborator: async (workspaceId, collaboratorId) => {
    const res = await axiosInstance.delete(`/workspaces/${workspaceId}/collaborators/${collaboratorId}`);
    return res?.data;
  },
};
