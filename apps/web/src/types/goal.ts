import type { Category } from './category';

export type GoalType = 'BINARY' | 'QUANTITY';

export type GoalPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export type GoalStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Goal {
  id: string;
  weekId: string;
  categoryId: string;
  title: string;
  description: string | null;
  type: GoalType;
  priority: GoalPriority;
  targetValue: number;
  currentValue: number;
  status: GoalStatus;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface CreateGoalInput {
  categoryId: string;
  title: string;
  description?: string;
  type: GoalType;
  priority?: GoalPriority;
  targetValue?: number;
}

export interface UpdateGoalInput {
  categoryId?: string;
  title?: string;
  description?: string;
  priority?: GoalPriority;
  targetValue?: number;
}

export interface GoalFilters {
  categoryId?: string;
  status?: GoalStatus;
}
