import api from './client';
import { LoginResponse, CVStatus, ChatHistory, ApplicationHistory, ApplicationResult } from '../types';

// Auth API
export const authAPI = {
  signup: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/signup', { email, password });
    return response.data;
  },

  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
};

// CV API
export const cvAPI = {
  getStatus: async (): Promise<CVStatus> => {
    const response = await api.get('/api/cv/status');
    return response.data;
  },

  upload: async (uri: string, name: string, type: string) => {
    const formData = new FormData();
    formData.append('file', {
      uri,
      name,
      type,
    } as any);

    const response = await api.post('/api/cv/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  delete: async () => {
    const response = await api.delete('/api/cv/delete');
    return response.data;
  },
};

// Chat API
export const chatAPI = {
  ask: async (question: string): Promise<{ answer: string }> => {
    const response = await api.post('/api/chat/ask', { question });
    return response.data;
  },

  getHistory: async (): Promise<ChatHistory[]> => {
    const response = await api.get('/api/chat/history');
    return response.data;
  },

  deleteMessage: async (messageId: number) => {
    const response = await api.delete(`/api/chat/history/${messageId}`);
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.delete('/api/chat/history');
    return response.data;
  },
};

// Application API
export const applicationAPI = {
  generate: async (
    job_description: string,
    application_type: 'cover_letter' | 'email'
  ): Promise<ApplicationResult> => {
    const response = await api.post('/api/application/generate', {
      job_description,
      application_type,
    });
    return response.data;
  },

  getHistory: async (): Promise<ApplicationHistory[]> => {
    const response = await api.get('/api/application/history');
    return response.data;
  },

  getDetail: async (applicationId: number): Promise<ApplicationHistory> => {
    const response = await api.get(`/api/application/history/${applicationId}`);
    return response.data;
  },

  deleteApplication: async (applicationId: number) => {
    const response = await api.delete(`/api/application/history/${applicationId}`);
    return response.data;
  },

  clearHistory: async () => {
    const response = await api.delete('/api/application/history');
    return response.data;
  },
};
