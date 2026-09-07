import { describe, it, expect, vi, beforeEach } from 'vitest';
import { weeksService } from './weeks.service';
import { apiClient } from '../lib/api-client';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('weeksService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar semanas sem filtro de status', async () => {
    const mockWeeks = [{ id: 'w-1', status: 'DRAFT' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockWeeks);

    const result = await weeksService.list();

    expect(result).toEqual(mockWeeks);
    expect(apiClient.get).toHaveBeenCalledWith('/weeks', { params: undefined });
  });

  it('deve listar semanas filtradas por status', async () => {
    const mockWeeks = [{ id: 'w-2', status: 'ACTIVE' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockWeeks);

    const result = await weeksService.list('ACTIVE');

    expect(result).toEqual(mockWeeks);
    expect(apiClient.get).toHaveBeenCalledWith('/weeks', { params: { status: 'ACTIVE' } });
  });

  it('deve buscar semana por id', async () => {
    const mockWeek = { id: 'w-1', status: 'DRAFT' };
    vi.mocked(apiClient.get).mockResolvedValue(mockWeek);

    const result = await weeksService.getById('w-1');

    expect(result).toEqual(mockWeek);
    expect(apiClient.get).toHaveBeenCalledWith('/weeks/w-1');
  });

  it('deve criar uma nova semana com startDate', async () => {
    const input = { startDate: '2026-09-07' };
    const mockCreated = { id: 'w-new', startDate: '2026-09-07', endDate: '2026-09-13', status: 'DRAFT' };
    vi.mocked(apiClient.post).mockResolvedValue(mockCreated);

    const result = await weeksService.create(input);

    expect(result).toEqual(mockCreated);
    expect(apiClient.post).toHaveBeenCalledWith('/weeks', input);
  });

  it('deve ativar uma semana via POST /weeks/:id/activate', async () => {
    const mockActivated = { id: 'w-1', status: 'ACTIVE' };
    vi.mocked(apiClient.post).mockResolvedValue(mockActivated);

    const result = await weeksService.activate('w-1');

    expect(result).toEqual(mockActivated);
    expect(apiClient.post).toHaveBeenCalledWith('/weeks/w-1/activate');
  });

  it('deve obter o resumo da semana via GET /weeks/:id/summary', async () => {
    const mockSummary = {
      week: { id: 'w-1', status: 'ACTIVE' },
      totalGoals: 4,
      completedGoals: 2,
      completionRate: 50,
      progressRate: 65,
      metrics: {
        totalGoals: 4,
        completedGoals: 2,
        completionRate: 50,
        progressRate: 65,
      },
      categories: [],
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockSummary);

    const result = await weeksService.getSummary('w-1');

    expect(result).toEqual(mockSummary);
    expect(apiClient.get).toHaveBeenCalledWith('/weeks/w-1/summary');
  });

  it('deve fechar uma semana via POST /weeks/:id/close', async () => {
    const mockClosed = {
      id: 'w-1',
      status: 'CLOSED',
      closedAt: '2026-09-13T23:59:59Z',
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockClosed);

    const result = await weeksService.close('w-1');

    expect(result).toEqual(mockClosed);
    expect(apiClient.post).toHaveBeenCalledWith('/weeks/w-1/close');
  });
});
