import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle authentication errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Redirect to login if not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (email: string, password: string) =>
    api.post('/api/auth/signup', { email, password }),
  
  login: (email: string, password: string) =>
    api.post('/api/auth/login', { email, password }),
};

// CV API
export const cvAPI = {
  getStatus: () => api.get('/api/cv/status'),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  delete: () => api.delete('/api/cv/delete'),
};

// Chat API
export const chatAPI = {
  ask: (question: string) =>
    api.post('/api/chat/ask', { question }),
  
  getHistory: () =>
    api.get('/api/chat/history'),
  
  deleteMessage: (messageId: number) =>
    api.delete(`/api/chat/history/${messageId}`),
  
  clearHistory: () =>
    api.delete('/api/chat/history'),
};

// Application API
export const applicationAPI = {
  generate: (job_description: string, application_type: 'cover_letter' | 'email') =>
    api.post('/api/application/generate', { job_description, application_type }),
  
  getHistory: () =>
    api.get('/api/application/history'),
  
  getDetail: (applicationId: number) =>
    api.get(`/api/application/history/${applicationId}`),
  
  deleteApplication: (applicationId: number) =>
    api.delete(`/api/application/history/${applicationId}`),
  
  clearHistory: () =>
    api.delete('/api/application/history'),
};
