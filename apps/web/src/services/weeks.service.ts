import { apiClient } from '../lib/api-client';
import type { Week, WeekStatus, CreateWeekInput } from '../types/week';

export const weeksService = {
  async list(status?: WeekStatus): Promise<Week[]> {
    const params = status ? { status } : undefined;
    return apiClient.get<Week[]>('/weeks', { params });
  },

  async getById(id: string): Promise<Week> {
    return apiClient.get<Week>(`/weeks/${id}`);
  },

  async create(data: CreateWeekInput): Promise<Week> {
    return apiClient.post<Week>('/weeks', data);
  },

  async activate(id: string): Promise<Week> {
    return apiClient.post<Week>(`/weeks/${id}/activate`);
  },
};
