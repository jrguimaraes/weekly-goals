import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reportsService } from './reports.service';
import { apiClient } from '../lib/api-client';
import type { ReportSnapshot } from '../types/report';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('reportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve obter o relatório consolidado via GET /weeks/:id/report', async () => {
    const mockReport: ReportSnapshot = {
      version: 1,
      generatedAt: '2026-09-13T23:59:59.000Z',
      week: {
        id: 'w-closed-1',
        startDate: '2026-09-07T00:00:00.000Z',
        endDate: '2026-09-13T23:59:59.000Z',
        status: 'CLOSED',
        closedAt: '2026-09-13T23:59:59.000Z',
        createdAt: '2026-09-07T00:00:00.000Z',
        updatedAt: '2026-09-13T23:59:59.000Z',
      },
      totalGoals: 2,
      completedGoals: 1,
      completionRate: 50,
      progressRate: 75,
      metrics: {
        totalGoals: 2,
        completedGoals: 1,
        completionRate: 50,
        progressRate: 75,
      },
      categories: [
        {
          categoryId: 'cat-1',
          categoryName: 'Saúde',
          totalGoals: 1,
          completedGoals: 1,
          completionRate: 100,
          progressRate: 100,
        },
      ],
      goals: [
        {
          id: 'g-1',
          title: 'Treinar 3x',
          description: null,
          type: 'QUANTITY',
          priority: 'HIGH',
          targetValue: 3,
          currentValue: 3,
          status: 'COMPLETED',
          completedAt: '2026-09-12T10:00:00.000Z',
          categoryId: 'cat-1',
          categoryName: 'Saúde',
        },
      ],
    };

    vi.mocked(apiClient.get).mockResolvedValue(mockReport);

    const result = await reportsService.getReport('w-closed-1');

    expect(result).toEqual(mockReport);
    expect(apiClient.get).toHaveBeenCalledWith('/weeks/w-closed-1/report');
  });
});
