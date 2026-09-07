import { apiClient } from '../lib/api-client';
import type { ReportSnapshot } from '../types/report';

export const reportsService = {
  async getReport(weekId: string): Promise<ReportSnapshot> {
    return apiClient.get<ReportSnapshot>(`/weeks/${weekId}/report`);
  },
};
