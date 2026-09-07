import { apiClient } from '../lib/api-client';
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '../types/category';

export const categoriesService = {
  async list(isActive?: boolean): Promise<Category[]> {
    const params = isActive !== undefined ? { isActive } : undefined;
    return apiClient.get<Category[]>('/categories', { params });
  },

  async getById(id: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  async create(data: CreateCategoryInput): Promise<Category> {
    return apiClient.post<Category>('/categories', data);
  },

  async update(id: string, data: UpdateCategoryInput): Promise<Category> {
    return apiClient.patch<Category>(`/categories/${id}`, data);
  },

  async archive(id: string): Promise<Category> {
    return apiClient.delete<Category>(`/categories/${id}`);
  },
};
