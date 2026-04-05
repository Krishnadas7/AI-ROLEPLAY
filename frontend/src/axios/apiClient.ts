import axios from "axios";

const baseUrl = import.meta.env.VITE_APP_BASE_URL || 'http://localhost:3000/api/v1'

const apiClient = axios.create({
  baseURL: baseUrl // Base URL for all requests with fallback
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      if (status === 404) {
        window.dispatchEvent(new CustomEvent('app-error', { detail: { type: '404' } }));
      } else if (status >= 500) {
        window.dispatchEvent(new CustomEvent('app-error', { detail: { type: '500' } }));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;