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

export interface WeekSummaryWeek {
  id: string;
  startDate: Date;
  endDate: Date;
  status: string;
  closedAt: Date | null;
}

export interface WeekSummaryResponse {
  week: WeekSummaryWeek;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  progressRate: number;
  metrics: MetricsResult;
  categories: CategoryMetricsResult[];
}

