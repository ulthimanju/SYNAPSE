import axios from 'axios';
import { env } from '../config/env';
import { STORAGE_KEYS } from '../config/constants';

const client = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token and Request ID
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!config.headers['X-Request-ID']) {
      config.headers['X-Request-ID'] = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize error payload
// NOTE: Do NOT clear localStorage tokens here. This interceptor fires for ALL
// requests (including background /auth/me probes). Clearing the token here
// causes a race condition where the token is deleted before workspace calls run.
// Session expiry is handled in ProtectedRoute and AppProviders only.
client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const responseData = error.response?.data;
    const normalizedError = {
      success: false,
      error: responseData?.error || {
        code: 'NETWORK_ERROR',
        message: error.message || 'An unexpected connection error occurred.',
        details: null,
      },
      request_id: responseData?.request_id || error.config?.headers?.['X-Request-ID'] || null,
      status: error.response?.status,
    };

    return Promise.reject(normalizedError);
  }
);

export default client;
