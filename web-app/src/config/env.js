const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return 'http://localhost:8000';
  }
  return 'http://localhost:8000';
};

export const env = {
  apiBaseUrl: getApiBaseUrl(),
  appName: import.meta.env.VITE_APP_NAME || 'Synapse',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
};
