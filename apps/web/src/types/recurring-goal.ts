import type { Category } from './category';
import type { GoalPriority, GoalType } from './goal';

export interface RecurringGoal {
  id: string;
  categoryId: string;
  title: string;
  description: string | null;
  type: GoalType;
  priority: GoalPriority;
  targetValue: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface CreateRecurringGoalInput {
  categoryId: string;
  title: string;
  description?: string;
  type: GoalType;
  priority?: GoalPriority;
  targetValue?: number;
  active?: boolean;
}

export interface UpdateRecurringGoalInput {
  categoryId?: string;
  title?: string;
  description?: string | null;
  priority?: GoalPriority;
  targetValue?: number;
  active?: boolean;
}
