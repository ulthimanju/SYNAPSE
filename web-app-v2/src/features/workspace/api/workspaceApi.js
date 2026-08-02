import { axiosInstance } from '../../../services/axios/axiosInstance';

export const workspaceApi = {
  // Workspaces CRUD
  getWorkspaces: async () => {
    try {
      const res = await axiosInstance.get('/workspaces');
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  getWorkspaceTitles: async () => {
    try {
      const res = await axiosInstance.get('/workspaces/titles');
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  getWorkspaceById: async (workspaceId) => {
    if (!workspaceId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}`);
      return res?.data?.data || res?.data || { id: workspaceId, name: 'Operating system' };
    } catch (err) {
      return { id: workspaceId, name: 'Operating system' };
    }
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
    if (!workspaceId) return [];
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/documents`);
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
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
    if (!workspaceId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/summary`);
      return res?.data?.data || res?.data || null;
    } catch (err) {
      return null;
    }
  },

  generateSummary: async (workspaceId) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/summary`);
    return res?.data?.data || res?.data;
  },

  getJobStatus: async (workspaceId, jobId) => {
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/jobs/${jobId}`);
      return res?.data?.data || res?.data;
    } catch (err) {
      return null;
    }
  },

  // Learning Path, Units, Flashcards & Quizzes
  getLearningPath: async (workspaceId) => {
    if (!workspaceId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/learning-path`);
      return res?.data?.data || res?.data || null;
    } catch (err) {
      return null;
    }
  },

  generateLearningPath: async (workspaceId) => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/learning-path`);
    return res?.data?.data || res?.data;
  },

  getUnitContent: async (workspaceId, unitId) => {
    if (!workspaceId || !unitId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/units/${unitId}`);
      return res?.data?.data || res?.data || null;
    } catch (err) {
      return null;
    }
  },

  generateFlashcards: async (workspaceId, topic = '') => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/flashcards`, { topic });
    return res?.data?.data || res?.data;
  },

  getFlashcards: async (workspaceId) => {
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/flashcards`);
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  generateQuiz: async (workspaceId, topic = '') => {
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/quizzes`, { topic });
    return res?.data?.data || res?.data;
  },

  getQuiz: async (workspaceId) => {
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/quizzes`);
      return res?.data?.data || res?.data;
    } catch (err) {
      return null;
    }
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
    if (!workspaceId) return [];
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/chat/history`);
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  clearChatHistory: async (workspaceId) => {
    const res = await axiosInstance.delete(`/workspaces/${workspaceId}/chat/history`);
    return res?.data;
  },

  // Collaborators & Access Control
  getCollaborators: async (workspaceId) => {
    if (!workspaceId) return [];
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/collaborators`);
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  getCollaboratorById: async (workspaceId, collaboratorId) => {
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/collaborators/${collaboratorId}`);
      return res?.data?.data || res?.data;
    } catch (err) {
      return null;
    }
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
