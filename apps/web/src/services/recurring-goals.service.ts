import { apiClient } from '../lib/api-client';
import type {
  RecurringGoal,
  CreateRecurringGoalInput,
  UpdateRecurringGoalInput,
} from '../types/recurring-goal';

export const recurringGoalsService = {
  async list(): Promise<RecurringGoal[]> {
    return apiClient.get<RecurringGoal[]>('/recurring-goals');
  },

  async getById(id: string): Promise<RecurringGoal> {
    return apiClient.get<RecurringGoal>(`/recurring-goals/${id}`);
  },

  async create(data: CreateRecurringGoalInput): Promise<RecurringGoal> {
    return apiClient.post<RecurringGoal>('/recurring-goals', data);
  },

  async update(id: string, data: UpdateRecurringGoalInput): Promise<RecurringGoal> {
    return apiClient.patch<RecurringGoal>(`/recurring-goals/${id}`, data);
  },

  async toggleActive(id: string): Promise<RecurringGoal> {
    return apiClient.patch<RecurringGoal>(`/recurring-goals/${id}/toggle`);
  },
};
