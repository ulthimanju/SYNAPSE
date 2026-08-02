import { axiosInstance } from '../../../services/axios/axiosInstance';

/**
 * Workspace API layer with strict workspaceId parameter requirements and AbortSignal support.
 */
export const workspaceApi = {
  // Workspaces CRUD
  getWorkspaces: async (signal = null) => {
    try {
      const res = await axiosInstance.get('/workspaces', { signal });
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return [];
      return [];
    }
  },

  getWorkspaceTitles: async (signal = null) => {
    try {
      const res = await axiosInstance.get('/workspaces/titles', { signal });
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return [];
      return [];
    }
  },

  getWorkspaceById: async (workspaceId, signal = null) => {
    if (!workspaceId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}`, { signal });
      return res?.data?.data || res?.data || { id: workspaceId, name: 'Operating system' };
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return null;
      return { id: workspaceId, name: 'Operating system' };
    }
  },

  createWorkspace: async (payload) => {
    const res = await axiosInstance.post('/workspaces', payload);
    return res?.data?.data || res?.data;
  },

  updateWorkspace: async (workspaceId, payload) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.patch(`/workspaces/${workspaceId}`, payload);
    return res?.data?.data || res?.data;
  },

  deleteWorkspace: async (workspaceId) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.delete(`/workspaces/${workspaceId}`);
    return res?.data;
  },

  // Documents Ingestion & Processing (Workspace-Scoped)
  getDocuments: async (workspaceId, signal = null) => {
    if (!workspaceId) return [];
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/documents`, { signal });
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return [];
      return [];
    }
  },

  uploadDocument: async (workspaceId, formData) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res?.data?.data || res?.data;
  },

  deleteDocument: async (workspaceId, documentId) => {
    if (!workspaceId || !documentId) throw new Error('workspaceId and documentId are required');
    const res = await axiosInstance.delete(`/documents/${documentId}`);
    return res?.data;
  },

  retryDocument: async (workspaceId, documentId) => {
    if (!workspaceId || !documentId) throw new Error('workspaceId and documentId are required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/documents/${documentId}/retry`);
    return res?.data?.data || res?.data;
  },

  // Executive Summary & Jobs (Workspace-Scoped)
  getSummary: async (workspaceId, signal = null) => {
    if (!workspaceId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/summary`, { signal });
      return res?.data?.data || res?.data || null;
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return null;
      return null;
    }
  },

  generateSummary: async (workspaceId) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/summary`);
    return res?.data?.data || res?.data;
  },

  getJobStatus: async (workspaceId, jobId, signal = null) => {
    if (!workspaceId || !jobId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/jobs/${jobId}`, { signal });
      return res?.data?.data || res?.data;
    } catch (err) {
      return null;
    }
  },

  // Learning Path, Units, Flashcards & Quizzes (Workspace-Scoped)
  getLearningPath: async (workspaceId, signal = null) => {
    if (!workspaceId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/learning-path`, { signal });
      return res?.data?.data || res?.data || null;
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return null;
      return null;
    }
  },

  generateLearningPath: async (workspaceId) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/learning-path`);
    return res?.data?.data || res?.data;
  },

  getUnitContent: async (workspaceId, unitId, signal = null) => {
    if (!workspaceId || !unitId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/units/${unitId}`, { signal });
      return res?.data?.data || res?.data || null;
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return null;
      return null;
    }
  },

  generateFlashcards: async (workspaceId, topic = '') => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/flashcards`, { topic });
    return res?.data?.data || res?.data;
  },

  getFlashcards: async (workspaceId, signal = null) => {
    if (!workspaceId) return [];
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/flashcards`, { signal });
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  generateQuiz: async (workspaceId, topic = '') => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/quizzes`, { topic });
    return res?.data?.data || res?.data;
  },

  getQuiz: async (workspaceId, signal = null) => {
    if (!workspaceId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/quizzes`, { signal });
      return res?.data?.data || res?.data;
    } catch (err) {
      return null;
    }
  },

  // RAG Retrieval & Conversational Assistant (Workspace-Scoped)
  retrieveContext: async (workspaceId, query, topK = 5, signal = null) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/retrieve`, { query, top_k: topK }, { signal });
    return res?.data?.data || res?.data;
  },

  sendChatMessage: async (workspaceId, message) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/chat`, { message });
    return res?.data?.data || res?.data;
  },

  getChatHistory: async (workspaceId, signal = null) => {
    if (!workspaceId) return [];
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/chat/history`, { signal });
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  clearChatHistory: async (workspaceId) => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.delete(`/workspaces/${workspaceId}/chat/history`);
    return res?.data;
  },

  // Collaborators & Access Control (Workspace-Scoped)
  getCollaborators: async (workspaceId, signal = null) => {
    if (!workspaceId) return [];
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/collaborators`, { signal });
      const data = res?.data?.data || res?.data;
      return Array.isArray(data) ? data : [];
    } catch (err) {
      return [];
    }
  },

  getCollaboratorById: async (workspaceId, collaboratorId, signal = null) => {
    if (!workspaceId || !collaboratorId) return null;
    try {
      const res = await axiosInstance.get(`/workspaces/${workspaceId}/collaborators/${collaboratorId}`, { signal });
      return res?.data?.data || res?.data;
    } catch (err) {
      return null;
    }
  },

  addCollaborator: async (workspaceId, email, role = 'viewer') => {
    if (!workspaceId) throw new Error('workspaceId is required');
    const res = await axiosInstance.post(`/workspaces/${workspaceId}/collaborators`, { email, role });
    return res?.data?.data || res?.data;
  },

  updateCollaboratorRole: async (workspaceId, collaboratorId, role) => {
    if (!workspaceId || !collaboratorId) throw new Error('workspaceId and collaboratorId are required');
    const res = await axiosInstance.patch(`/workspaces/${workspaceId}/collaborators/${collaboratorId}`, { role });
    return res?.data?.data || res?.data;
  },

  removeCollaborator: async (workspaceId, collaboratorId) => {
    if (!workspaceId || !collaboratorId) throw new Error('workspaceId and collaboratorId are required');
    const res = await axiosInstance.delete(`/workspaces/${workspaceId}/collaborators/${collaboratorId}`);
    return res?.data;
  },
};
