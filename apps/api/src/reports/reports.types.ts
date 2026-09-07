import {
  CategoryMetricsResult,
  MetricsResult,
  WeekSummaryWeek,
} from '../metrics/metrics.types.js';

export const REPORT_SCHEMA_VERSION = 1;

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
}
