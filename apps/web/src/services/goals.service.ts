import { apiClient } from '../lib/api-client';
import type {
  Goal,
  CreateGoalInput,
  UpdateGoalInput,
  GoalFilters,
} from '../types/goal';

export const goalsService = {
  async listByWeek(weekId: string, filters?: GoalFilters): Promise<Goal[]> {
    const params = filters
      ? {
          categoryId: filters.categoryId,
          status: filters.status,
        }
      : undefined;
    return apiClient.get<Goal[]>(`/weeks/${weekId}/goals`, { params });
  },

  async getById(id: string): Promise<Goal> {
    return apiClient.get<Goal>(`/goals/${id}`);
  },

  async create(weekId: string, data: CreateGoalInput): Promise<Goal> {
    return apiClient.post<Goal>(`/weeks/${weekId}/goals`, data);
  },

  async update(id: string, data: UpdateGoalInput): Promise<Goal> {
    return apiClient.patch<Goal>(`/goals/${id}`, data);
  },

  async delete(id: string): Promise<Goal> {
    return apiClient.delete<Goal>(`/goals/${id}`);
  },

  async updateProgress(id: string, currentValue: number): Promise<Goal> {
    return apiClient.patch<Goal>(`/goals/${id}/progress`, { currentValue });
  },
};
