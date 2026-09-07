export type WeekStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface Week {
  id: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeekInput {
  startDate: string;
}

export interface MetricsResult {
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  progressRate: number;
}

export interface CategoryMetricsResult extends MetricsResult {
  categoryId: string;
  categoryName: string;
}

export interface WeekSummary {
  week: Week;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  progressRate: number;
  metrics: MetricsResult;
  categories: CategoryMetricsResult[];
}

