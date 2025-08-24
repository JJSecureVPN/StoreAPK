import axios from 'axios';
import type { App, AppWithDetails, Comment, LikeResponse, DownloadResponse, UploadResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

export const appsAPI = {
  // Get all apps
  getAllApps: async (): Promise<App[]> => {
    const response = await api.get('/apps');
    return response.data;
  },

  // Get app by ID
  getAppById: async (id: number): Promise<AppWithDetails> => {
    const response = await api.get(`/apps/${id}`);
    return response.data;
  },

  // Create new app
  createApp: async (appData: Partial<App>): Promise<App> => {
    const response = await api.post('/apps', appData);
    return response.data;
  },

  // Add comment
  addComment: async (appId: number, username: string, content: string): Promise<Comment> => {
    const response = await api.post(`/apps/${appId}/comments`, { username, content });
    return response.data;
  },

  // Toggle like
  toggleLike: async (appId: number, username: string): Promise<LikeResponse> => {
    const response = await api.post(`/apps/${appId}/like`, { username });
    return response.data;
  },

  // Download app
  downloadApp: async (appId: number): Promise<DownloadResponse> => {
    const response = await api.post(`/apps/${appId}/download`);
    return response.data;
  },

  // Add screenshots
  addScreenshots: async (appId: number, screenshots: Array<{ image_url: string; position: number }>): Promise<any> => {
    const response = await api.post(`/apps/${appId}/screenshots`, { screenshots });
    return response.data;
  },

  // Upload files
  uploadFiles: async (formData: FormData): Promise<UploadResponse> => {
    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete file
  deleteFile: async (type: string, filename: string): Promise<void> => {
    await api.delete(`/upload/${type}/${filename}`);
  },
};

export default api;
