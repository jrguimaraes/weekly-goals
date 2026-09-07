import { GoalStatus, GoalType } from '@prisma/client';
import { beforeEach, describe, expect, it } from 'vitest';
import { MetricsService } from './metrics.service.js';
import { GoalForMetrics } from './metrics.types.js';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(() => {
    service = new MetricsService();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('round', () => {
    it('deve arredondar valores para até 2 casas decimais', () => {
      expect(service.round(33.3333333)).toBe(33.33);
      expect(service.round(66.6666667)).toBe(66.67);
      expect(service.round(100)).toBe(100);
      expect(service.round(0)).toBe(0);
      expect(service.round(50.5)).toBe(50.5);
    });
  });

  describe('calculateGoalProgress', () => {
    it('deve retornar 0 para meta BINARY com currentValue 0', () => {
      const goal: GoalForMetrics = {
        type: GoalType.BINARY,
        targetValue: 1,
        currentValue: 0,
        status: GoalStatus.PENDING,
      };

      expect(service.calculateGoalProgress(goal)).toBe(0);
    });

    it('deve retornar 100 para meta BINARY com currentValue 1', () => {
      const goal: GoalForMetrics = {
        type: GoalType.BINARY,
        targetValue: 1,
        currentValue: 1,
        status: GoalStatus.COMPLETED,
      };

      expect(service.calculateGoalProgress(goal)).toBe(100);
    });

    it('deve retornar 100 para meta BINARY se status for COMPLETED mesmo com currentValue 0', () => {
      const goal: GoalForMetrics = {
        type: GoalType.BINARY,
        targetValue: 1,
        currentValue: 0,
        status: GoalStatus.COMPLETED,
      };

      expect(service.calculateGoalProgress(goal)).toBe(100);
    });

    it('deve calcular progresso proporcional para meta QUANTITY', () => {
      const goal: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: 4,
        status: GoalStatus.IN_PROGRESS,
      };

      expect(service.calculateGoalProgress(goal)).toBe(40);
    });

    it('deve limitar a 100% o progresso de meta QUANTITY que superou o targetValue', () => {
      const goal: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: 15,
        status: GoalStatus.COMPLETED,
      };

      expect(service.calculateGoalProgress(goal)).toBe(100);
    });

    it('deve retornar 0 para meta QUANTITY com currentValue 0 ou negativo', () => {
      const goalZero: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: 0,
        status: GoalStatus.PENDING,
      };
      const goalNegative: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: -5,
        status: GoalStatus.PENDING,
      };

      expect(service.calculateGoalProgress(goalZero)).toBe(0);
      expect(service.calculateGoalProgress(goalNegative)).toBe(0);
    });

    it('deve retornar 0 caso targetValue seja menor ou igual a zero para evitar divisão por zero', () => {
      const goalInvalidTarget: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 0,
        currentValue: 5,
        status: GoalStatus.IN_PROGRESS,
      };

      expect(service.calculateGoalProgress(goalInvalidTarget)).toBe(0);
    });
  });

  describe('isGoalCompleted', () => {
    it('deve considerar concluída meta com status COMPLETED', () => {
      const goal: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: 5,
        status: GoalStatus.COMPLETED,
      };

      expect(service.isGoalCompleted(goal)).toBe(true);
    });

    it('deve considerar concluída meta BINARY com currentValue >= 1', () => {
      const goal: GoalForMetrics = {
        type: GoalType.BINARY,
        targetValue: 1,
        currentValue: 1,
        status: GoalStatus.PENDING,
      };

      expect(service.isGoalCompleted(goal)).toBe(true);
    });

    it('deve considerar não concluída meta BINARY com currentValue 0', () => {
      const goal: GoalForMetrics = {
        type: GoalType.BINARY,
        targetValue: 1,
        currentValue: 0,
        status: GoalStatus.PENDING,
      };

      expect(service.isGoalCompleted(goal)).toBe(false);
    });

    it('deve considerar concluída meta QUANTITY com currentValue >= targetValue', () => {
      const goalExact: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: 10,
        status: GoalStatus.PENDING,
      };
      const goalExceeded: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: 12,
        status: GoalStatus.PENDING,
      };

      expect(service.isGoalCompleted(goalExact)).toBe(true);
      expect(service.isGoalCompleted(goalExceeded)).toBe(true);
    });

    it('deve considerar não concluída meta QUANTITY com currentValue < targetValue', () => {
      const goal: GoalForMetrics = {
        type: GoalType.QUANTITY,
        targetValue: 10,
        currentValue: 9.9,
        status: GoalStatus.IN_PROGRESS,
      };

      expect(service.isGoalCompleted(goal)).toBe(false);
    });
  });

  describe('calculateMetrics', () => {
    it('deve retornar métricas zeradas sem divisão por zero para lista de metas vazia', () => {
      const result = service.calculateMetrics([]);

      expect(result).toEqual({
        totalGoals: 0,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 0,
      });
    });

    it('deve calcular 100% para completionRate e progressRate quando todas as metas estiverem concluídas', () => {
      const goals: GoalForMetrics[] = [
        {
          type: GoalType.BINARY,
          targetValue: 1,
          currentValue: 1,
          status: GoalStatus.COMPLETED,
        },
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 10,
          status: GoalStatus.COMPLETED,
        },
      ];

      const result = service.calculateMetrics(goals);

      expect(result).toEqual({
        totalGoals: 2,
        completedGoals: 2,
        completionRate: 100,
        progressRate: 100,
      });
    });

    it('deve calcular 0% quando nenhuma meta tiver progresso', () => {
      const goals: GoalForMetrics[] = [
        {
          type: GoalType.BINARY,
          targetValue: 1,
          currentValue: 0,
          status: GoalStatus.PENDING,
        },
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 0,
          status: GoalStatus.PENDING,
        },
      ];

      const result = service.calculateMetrics(goals);

      expect(result).toEqual({
        totalGoals: 2,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 0,
      });
    });

    it('deve calcular métricas parciais com arredondamento preciso', () => {
      // 3 metas:
      // 1. BINARY completa (100% progresso, 1 completa)
      // 2. QUANTITY parcial 5/10 (50% progresso, 0 completa)
      // 3. QUANTITY não iniciada 0/10 (0% progresso, 0 completa)
      // Completion: 1 / 3 = 33.33%
      // Progress: (100 + 50 + 0) / 3 = 50%
      const goals: GoalForMetrics[] = [
        {
          type: GoalType.BINARY,
          targetValue: 1,
          currentValue: 1,
          status: GoalStatus.COMPLETED,
        },
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 5,
          status: GoalStatus.IN_PROGRESS,
        },
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 0,
          status: GoalStatus.PENDING,
        },
      ];

      const result = service.calculateMetrics(goals);

      expect(result).toEqual({
        totalGoals: 3,
        completedGoals: 1,
        completionRate: 33.33,
        progressRate: 50,
      });
    });

    it('não deve permitir que meta que superou o targetValue distorça a média de progresso', () => {
      // 2 metas:
      // 1. QUANTITY com 200% de progresso (20/10) -> limitada a 100%
      // 2. QUANTITY com 0% de progresso (0/10)
      // Se não houvesse teto: (200 + 0) / 2 = 100% (distorceria, indicando que tudo foi concluído)
      // Com teto de 100%: (100 + 0) / 2 = 50%
      const goals: GoalForMetrics[] = [
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 20,
          status: GoalStatus.COMPLETED,
        },
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 0,
          status: GoalStatus.PENDING,
        },
      ];

      const result = service.calculateMetrics(goals);

      expect(result).toEqual({
        totalGoals: 2,
        completedGoals: 1,
        completionRate: 50,
        progressRate: 50,
      });
    });

    it('deve calcular 66.67% de completionRate quando 2 de 3 metas estiverem completadas', () => {
      const goals: GoalForMetrics[] = [
        {
          type: GoalType.BINARY,
          targetValue: 1,
          currentValue: 1,
          status: GoalStatus.COMPLETED,
        },
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 10,
          status: GoalStatus.COMPLETED,
        },
        {
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 2,
          status: GoalStatus.IN_PROGRESS,
        },
      ];

      const result = service.calculateMetrics(goals);

      expect(result.totalGoals).toBe(3);
      expect(result.completedGoals).toBe(2);
      expect(result.completionRate).toBe(66.67);
      // Progress: (100 + 100 + 20) / 3 = 220 / 3 = 73.33
      expect(result.progressRate).toBe(73.33);
    });
  });

  describe('calculateCategoryMetrics', () => {
    const categories = [
      { id: 'cat-saude', name: 'Saúde' },
      { id: 'cat-estudos', name: 'Estudos' },
      { id: 'cat-lazer', name: 'Lazer' },
    ];

    it('deve calcular métricas agrupadas por categoria corretamente', () => {
      const goals: GoalForMetrics[] = [
        // Categoria Saúde: 2 metas (1 completa 100%, 1 parcial 50%)
        {
          categoryId: 'cat-saude',
          type: GoalType.BINARY,
          targetValue: 1,
          currentValue: 1,
          status: GoalStatus.COMPLETED,
        },
        {
          categoryId: 'cat-saude',
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 5,
          status: GoalStatus.IN_PROGRESS,
        },
        // Categoria Estudos: 1 meta (superou target 15/10 -> 100%)
        {
          categoryId: 'cat-estudos',
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 15,
          status: GoalStatus.COMPLETED,
        },
        // Categoria Lazer: 0 metas
      ];

      const results = service.calculateCategoryMetrics(goals, categories);

      expect(results).toHaveLength(3);

      const saude = results.find((r) => r.categoryId === 'cat-saude');
      expect(saude).toEqual({
        categoryId: 'cat-saude',
        categoryName: 'Saúde',
        totalGoals: 2,
        completedGoals: 1,
        completionRate: 50,
        progressRate: 75,
      });

      const estudos = results.find((r) => r.categoryId === 'cat-estudos');
      expect(estudos).toEqual({
        categoryId: 'cat-estudos',
        categoryName: 'Estudos',
        totalGoals: 1,
        completedGoals: 1,
        completionRate: 100,
        progressRate: 100,
      });

      const lazer = results.find((r) => r.categoryId === 'cat-lazer');
      expect(lazer).toEqual({
        categoryId: 'cat-lazer',
        categoryName: 'Lazer',
        totalGoals: 0,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 0,
      });
    });
  });
});
