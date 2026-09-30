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
  notes?: string | null;
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
  notes?: string;
  type: GoalType;
  priority?: GoalPriority;
  targetValue?: number;
  isRecurring?: boolean;
}

export interface UpdateGoalInput {
  categoryId?: string;
  title?: string;
  description?: string;
  notes?: string | null;
  priority?: GoalPriority;
  targetValue?: number;
  isRecurring?: boolean;
}

export interface GoalFilters {
  categoryId?: string;
  status?: GoalStatus;
}

export interface ImportGoalsInput {
  goalIds: string[];
}

export interface ImportableGoalItem {
  id: string;
  title: string;
  description: string | null;
  type: GoalType;
  priority: GoalPriority;
  targetValue: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    isActive: boolean;
  };
  isAlreadyPresent: boolean;
}

export interface ImportableGoalsResponse {
  previousWeek: {
    id: string;
    startDate: string;
    endDate: string;
  } | null;
  goals: ImportableGoalItem[];
}

