// src/services/api.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Interceptor para errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error.message);
    console.error('URL:', error.config?.url);
    console.error('Status:', error.response?.status);
    console.error('Response:', error.response?.data);
    console.error('================');
    return Promise.reject(error);
  }
);