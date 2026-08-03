import axios from 'axios';

/**
 * Production Axios instance configured for HttpOnly Cookie Authentication.
 * Includes automatic 401 Token Refresh Interceptor and session recovery.
 */
export const axiosInstance = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Automatically sends & receives HttpOnly Cookies (access_token, refresh_token)
  // Do NOT set a default Content-Type here.
  // Axios automatically sets:
  //   • application/json for plain object payloads
  //   • multipart/form-data; boundary=... for FormData payloads
  // A hardcoded default overrides the auto-generated multipart boundary → 422 on file uploads.
});


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Handles 401 Unauthorized via Silent Refresh
// and 503 Google Drive token expiry via Silent Google Token Refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ── 401: Silent Synapse JWT Refresh ─────────────────────────────────────
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/google/login')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axiosInstance.post('/auth/refresh');
        processQueue(null);
        return axiosInstance(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login?session_expired=1';
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 503: Silent Google Drive Token Refresh & Retry ──────────────────────
    // Triggered when document upload/download fails due to expired Google OAuth token.
    if (
      error.response?.status === 503 &&
      !originalRequest._googleRetry
    ) {
      const errorCode = error.response?.data?.error?.code;
      const errorMsg = error.response?.data?.error?.message || '';
      const isGoogleAuthError =
        errorCode === 'SERVICE_UNAVAILABLE' &&
        (errorMsg.includes('Google Drive') || errorMsg.includes('OAuth'));

      if (isGoogleAuthError) {
        originalRequest._googleRetry = true;
        try {
          await axiosInstance.post('/auth/google/refresh-token');
          // Retry original request after silent Google token refresh
          return axiosInstance(originalRequest);
        } catch (googleRefreshErr) {
          // Token refresh failed — user must re-authenticate with Google
          return Promise.reject(googleRefreshErr);
        }
      }
    }

    return Promise.reject(error);
  }
);
