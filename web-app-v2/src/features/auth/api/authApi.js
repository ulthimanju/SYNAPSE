import { axiosInstance } from '../../../services/axios/axiosInstance';

export const authApi = {
  // Initiates Google OAuth Login
  initiateGoogleLogin: () => {
    window.location.href = '/api/v1/auth/google/login';
  },

  // Verifies current HttpOnly Cookie session
  getSession: async () => {
    const res = await axiosInstance.get('/auth/session');
    return res?.data?.data || res?.data;
  },

  // Performs refresh token rotation
  refreshSession: async () => {
    const res = await axiosInstance.post('/auth/refresh');
    return res?.data?.data || res?.data;
  },

  // Logs out user and revokes HttpOnly cookies
  logout: async () => {
    const res = await axiosInstance.post('/auth/logout');
    return res?.data;
  },

  // Checks lightweight auth status
  getStatus: async () => {
    const res = await axiosInstance.get('/auth/status');
    return res?.data?.data || res?.data;
  },

  // Gets current user profile
  getMe: async () => {
    const res = await axiosInstance.get('/auth/me');
    return res?.data?.data || res?.data;
  },
};
