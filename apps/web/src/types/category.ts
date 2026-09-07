export interface Category {
  id: string;
  name: string;
  description: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryInput {
  name: string;
  description?: string;
  position?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  position?: number;
  isActive?: boolean;
}
