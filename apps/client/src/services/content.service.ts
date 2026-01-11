import { api } from './api';
import type {
  Content,
  CreateContentDto,
  GenerateContentResponse,
  ContentStatusResponse,
  ContentListResponse,
  ContentStats,
} from '../types/content.types';

export const contentService = {
  // Generate new content (queued with delay)
  async generateContent(data: CreateContentDto): Promise<GenerateContentResponse> {
    const response = await api.post<GenerateContentResponse>('/content/generate', data);
    return response.data;
  },

  // Get content status by job ID
  async getContentStatus(jobId: string): Promise<ContentStatusResponse> {
    const response = await api.get<ContentStatusResponse>(`/content/${jobId}/status`);
    return response.data;
  },

  // Get all content for user
  async getAllContent(params?: {
    page?: number;
    limit?: number;
    status?: string;
    contentType?: string;
  }): Promise<ContentListResponse> {
    const response = await api.get<ContentListResponse>('/content', { params });
    return response.data;
  },

  // Get single content by ID
  async getContentById(id: string): Promise<Content> {
    const response = await api.get<Content>(`/content/${id}`);
    return response.data;
  },

  // Update content
  async updateContent(
    id: string,
    data: { title?: string; generatedText?: string }
  ): Promise<Content> {
    const response = await api.put<Content>(`/content/${id}`, data);
    return response.data;
  },

  // Delete content
  async deleteContent(id: string): Promise<void> {
    await api.delete(`/content/${id}`);
  },

  // Search content
  async searchContent(query: string, limit?: number): Promise<Content[]> {
    const response = await api.get<Content[]>('/content/search', {
      params: { q: query, limit },
    });
    return response.data;
  },

  // Get user statistics
  async getStats(): Promise<ContentStats> {
    const response = await api.get<ContentStats>('/content/stats');
    return response.data;
  },
};
