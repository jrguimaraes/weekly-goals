import { GoalPriority, GoalStatus, GoalType } from '@prisma/client';
import {
  CategoryMetricsResult,
  MetricsResult,
  WeekSummaryWeek,
} from '../metrics/metrics.types.js';

export const REPORT_SCHEMA_VERSION = 1;

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
  week: WeekSummaryWeek;
  totalGoals: number;
  completedGoals: number;
  completionRate: number;
  progressRate: number;
  metrics: MetricsResult;
  categories: CategoryMetricsResult[];
  goals: GoalSnapshot[];
}

