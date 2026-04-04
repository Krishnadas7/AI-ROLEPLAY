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
    return Promise.reject(error);
  }
);

export default apiClient;