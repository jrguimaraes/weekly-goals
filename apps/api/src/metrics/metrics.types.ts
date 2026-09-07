import { GoalPriority, GoalStatus, GoalType } from '@prisma/client';

export interface GoalForMetrics {
  id?: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  status: GoalStatus;
  priority?: GoalPriority;
  categoryId?: string;
}

export interface MetricsResult {
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  progressRate: number;
}

export interface CategorySummaryCategory {
  id: string;
  name: string;
}

export interface CategoryMetricsResult extends MetricsResult {
  categoryId: string;
  categoryName: string;
}
