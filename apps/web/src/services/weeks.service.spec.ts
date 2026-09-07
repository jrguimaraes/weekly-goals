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
});
