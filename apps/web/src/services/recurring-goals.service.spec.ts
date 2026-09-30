import { describe, expect, it, vi, beforeEach } from 'vitest';
import { apiClient } from '../lib/api-client';
import { recurringGoalsService } from './recurring-goals.service';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('recurringGoalsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar metas recorrentes via GET /recurring-goals', async () => {
    const mockList = [{ id: 'rec-1', title: 'Estudar Anki' }];
    vi.mocked(apiClient.get).mockResolvedValue(mockList);

    const result = await recurringGoalsService.list();

    expect(apiClient.get).toHaveBeenCalledWith('/recurring-goals');
    expect(result).toEqual(mockList);
  });

  it('deve obter meta recorrente por ID via GET /recurring-goals/:id', async () => {
    const mockItem = { id: 'rec-1', title: 'Estudar Anki' };
    vi.mocked(apiClient.get).mockResolvedValue(mockItem);

    const result = await recurringGoalsService.getById('rec-1');

    expect(apiClient.get).toHaveBeenCalledWith('/recurring-goals/rec-1');
    expect(result).toEqual(mockItem);
  });

  it('deve criar meta recorrente via POST /recurring-goals', async () => {
    const payload = {
      categoryId: 'cat-1',
      title: 'Estudar Anki',
      type: 'QUANTITY' as const,
      targetValue: 5,
    };
    const mockCreated = { id: 'rec-1', ...payload };
    vi.mocked(apiClient.post).mockResolvedValue(mockCreated);

    const result = await recurringGoalsService.create(payload);

    expect(apiClient.post).toHaveBeenCalledWith('/recurring-goals', payload);
    expect(result).toEqual(mockCreated);
  });

  it('deve atualizar meta recorrente via PATCH /recurring-goals/:id', async () => {
    const payload = { targetValue: 10 };
    const mockUpdated = { id: 'rec-1', targetValue: 10 };
    vi.mocked(apiClient.patch).mockResolvedValue(mockUpdated);

    const result = await recurringGoalsService.update('rec-1', payload);

    expect(apiClient.patch).toHaveBeenCalledWith('/recurring-goals/rec-1', payload);
    expect(result).toEqual(mockUpdated);
  });

  it('deve alternar status ativo via PATCH /recurring-goals/:id/toggle', async () => {
    const mockToggled = { id: 'rec-1', active: false };
    vi.mocked(apiClient.patch).mockResolvedValue(mockToggled);

    const result = await recurringGoalsService.toggleActive('rec-1');

    expect(apiClient.patch).toHaveBeenCalledWith('/recurring-goals/rec-1/toggle');
    expect(result).toEqual(mockToggled);
  });
});
