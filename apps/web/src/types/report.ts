import type { GoalPriority, GoalStatus, GoalType } from './goal';
import type { CategoryMetricsResult, MetricsResult, Week } from './week';

export interface GoalSnapshot {
  id: string;
  title: string;
  description: string | null;
  type: GoalType;
  priority: GoalPriority;
  targetValue: number;
  currentValue: number;
  status: GoalStatus;
  completedAt: string | null;
  categoryId: string;
  categoryName?: string;
}

export interface ReportSnapshot {
  version: number;
  generatedAt: string;
  week: Week;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  progressRate: number;
  metrics: MetricsResult;
  categories: CategoryMetricsResult[];
  goals: GoalSnapshot[];
}
