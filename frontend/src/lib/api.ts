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
};
