import { describe, it, expect, vi, beforeEach } from 'vitest';
import { goalsService } from './goals.service';
import { apiClient } from '../lib/api-client';
import type { Goal, CreateGoalInput, UpdateGoalInput } from '../types/goal';

vi.mock('../lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('goalsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve listar metas de uma semana sem filtros', async () => {
    const mockGoals: Goal[] = [
      {
        id: 'g-1',
        weekId: 'w-1',
        categoryId: 'c-1',
        title: 'Meta 1',
        description: null,
        type: 'BINARY',
        priority: 'MEDIUM',
        targetValue: 1,
        currentValue: 0,
        status: 'PENDING',
        completedAt: null,
        createdAt: '2026-09-07T00:00:00Z',
        updatedAt: '2026-09-07T00:00:00Z',
      },
    ];
    vi.mocked(apiClient.get).mockResolvedValue(mockGoals);

    const result = await goalsService.listByWeek('w-1');

    expect(result).toEqual(mockGoals);
    expect(apiClient.get).toHaveBeenCalledWith('/weeks/w-1/goals', {
      params: undefined,
    });
  });

  it('deve listar metas de uma semana com filtros de categoryId e status', async () => {
    const mockGoals: Goal[] = [];
    vi.mocked(apiClient.get).mockResolvedValue(mockGoals);

    const result = await goalsService.listByWeek('w-1', {
      categoryId: 'c-1',
      status: 'IN_PROGRESS',
    });

    expect(result).toEqual(mockGoals);
    expect(apiClient.get).toHaveBeenCalledWith('/weeks/w-1/goals', {
      params: {
        categoryId: 'c-1',
        status: 'IN_PROGRESS',
      },
    });
  });

  it('deve buscar meta por id', async () => {
    const mockGoal: Goal = {
      id: 'g-1',
      weekId: 'w-1',
      categoryId: 'c-1',
      title: 'Meta 1',
      description: 'Descrição',
      type: 'QUANTITY',
      priority: 'HIGH',
      targetValue: 5,
      currentValue: 2,
      status: 'IN_PROGRESS',
      completedAt: null,
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };
    vi.mocked(apiClient.get).mockResolvedValue(mockGoal);

    const result = await goalsService.getById('g-1');

    expect(result).toEqual(mockGoal);
    expect(apiClient.get).toHaveBeenCalledWith('/goals/g-1');
  });

  it('deve criar uma meta para uma semana', async () => {
    const input: CreateGoalInput = {
      categoryId: 'c-1',
      title: 'Beber 2L de água por dia',
      description: 'Manter hidratação',
      type: 'QUANTITY',
      priority: 'HIGH',
      targetValue: 7,
    };
    const mockCreated: Goal = {
      id: 'g-new',
      weekId: 'w-1',
      ...input,
      description: input.description ?? null,
      priority: 'HIGH',
      targetValue: 7,
      currentValue: 0,
      status: 'PENDING',
      completedAt: null,
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };
    vi.mocked(apiClient.post).mockResolvedValue(mockCreated);

    const result = await goalsService.create('w-1', input);

    expect(result).toEqual(mockCreated);
    expect(apiClient.post).toHaveBeenCalledWith('/weeks/w-1/goals', input);
  });

  it('deve atualizar uma meta', async () => {
    const input: UpdateGoalInput = {
      title: 'Título atualizado',
      targetValue: 10,
    };
    const mockUpdated: Goal = {
      id: 'g-1',
      weekId: 'w-1',
      categoryId: 'c-1',
      title: 'Título atualizado',
      description: null,
      type: 'QUANTITY',
      priority: 'MEDIUM',
      targetValue: 10,
      currentValue: 0,
      status: 'PENDING',
      completedAt: null,
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };
    vi.mocked(apiClient.patch).mockResolvedValue(mockUpdated);

    const result = await goalsService.update('g-1', input);

    expect(result).toEqual(mockUpdated);
    expect(apiClient.patch).toHaveBeenCalledWith('/goals/g-1', input);
  });

  it('deve excluir uma meta', async () => {
    const mockDeleted: Goal = {
      id: 'g-1',
      weekId: 'w-1',
      categoryId: 'c-1',
      title: 'Excluída',
      description: null,
      type: 'BINARY',
      priority: 'LOW',
      targetValue: 1,
      currentValue: 0,
      status: 'PENDING',
      completedAt: null,
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };
    vi.mocked(apiClient.delete).mockResolvedValue(mockDeleted);

    const result = await goalsService.delete('g-1');

    expect(result).toEqual(mockDeleted);
    expect(apiClient.delete).toHaveBeenCalledWith('/goals/g-1');
  });

  it('deve atualizar o progresso de uma meta via PATCH /goals/:id/progress', async () => {
    const mockUpdated: Goal = {
      id: 'g-1',
      weekId: 'w-1',
      categoryId: 'c-1',
      title: 'Meta',
      description: null,
      type: 'QUANTITY',
      priority: 'MEDIUM',
      targetValue: 5,
      currentValue: 3,
      status: 'IN_PROGRESS',
      completedAt: null,
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
    };
    vi.mocked(apiClient.patch).mockResolvedValue(mockUpdated);

    const result = await goalsService.updateProgress('g-1', 3);

    expect(result).toEqual(mockUpdated);
    expect(apiClient.patch).toHaveBeenCalledWith('/goals/g-1/progress', {
      currentValue: 3,
    });
  });
});
