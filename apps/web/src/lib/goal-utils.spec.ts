import { describe, it, expect } from 'vitest';
import { sortGoalsByPriority } from './goal-utils';
import type { Goal } from '../types/goal';

describe('goal-utils', () => {
  describe('sortGoalsByPriority', () => {
    it('deve ordenar metas por prioridade decrescente (HIGH > MEDIUM > LOW)', () => {
      const goals: Goal[] = [
        {
          id: 'g-1',
          weekId: 'w-1',
          categoryId: 'c-1',
          title: 'Meta Baixa',
          description: null,
          type: 'BINARY',
          priority: 'LOW',
          targetValue: 1,
          currentValue: 0,
          status: 'PENDING',
          completedAt: null,
          createdAt: '2026-09-08T01:00:00Z',
          updatedAt: '2026-09-08T01:00:00Z',
        },
        {
          id: 'g-2',
          weekId: 'w-1',
          categoryId: 'c-1',
          title: 'Meta Alta',
          description: null,
          type: 'BINARY',
          priority: 'HIGH',
          targetValue: 1,
          currentValue: 0,
          status: 'PENDING',
          completedAt: null,
          createdAt: '2026-09-08T02:00:00Z',
          updatedAt: '2026-09-08T02:00:00Z',
        },
        {
          id: 'g-3',
          weekId: 'w-1',
          categoryId: 'c-1',
          title: 'Meta Média',
          description: null,
          type: 'BINARY',
          priority: 'MEDIUM',
          targetValue: 1,
          currentValue: 0,
          status: 'PENDING',
          completedAt: null,
          createdAt: '2026-09-08T03:00:00Z',
          updatedAt: '2026-09-08T03:00:00Z',
        },
      ];

      const sorted = sortGoalsByPriority(goals);

      expect(sorted.map((g) => g.title)).toEqual([
        'Meta Alta',
        'Meta Média',
        'Meta Baixa',
      ]);
    });

    it('deve desempatar por data de criação (mais antiga primeiro) quando prioridades forem iguais', () => {
      const goals: Goal[] = [
        {
          id: 'g-2',
          weekId: 'w-1',
          categoryId: 'c-1',
          title: 'Segunda Alta',
          description: null,
          type: 'BINARY',
          priority: 'HIGH',
          targetValue: 1,
          currentValue: 0,
          status: 'PENDING',
          completedAt: null,
          createdAt: '2026-09-08T10:00:00Z',
          updatedAt: '2026-09-08T10:00:00Z',
        },
        {
          id: 'g-1',
          weekId: 'w-1',
          categoryId: 'c-1',
          title: 'Primeira Alta',
          description: null,
          type: 'BINARY',
          priority: 'HIGH',
          targetValue: 1,
          currentValue: 0,
          status: 'PENDING',
          completedAt: null,
          createdAt: '2026-09-08T08:00:00Z',
          updatedAt: '2026-09-08T08:00:00Z',
        },
      ];

      const sorted = sortGoalsByPriority(goals);

      expect(sorted.map((g) => g.title)).toEqual([
        'Primeira Alta',
        'Segunda Alta',
      ]);
    });

    it('deve retornar lista vazia quando receber lista vazia', () => {
      expect(sortGoalsByPriority([])).toEqual([]);
    });
  });
});
