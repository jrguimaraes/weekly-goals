import { Test, TestingModule } from '@nestjs/testing';
import { GoalPriority, GoalStatus, GoalType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeekGoalsController } from './week-goals.controller.js';
import { GoalsService } from './goals.service.js';

describe('WeekGoalsController', () => {
  let controller: WeekGoalsController;
  let service: GoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeekGoalsController],
      providers: [
        {
          provide: GoalsService,
          useValue: {
            create: vi.fn(),
            findByWeekId: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WeekGoalsController>(WeekGoalsController);
    service = module.get<GoalsService>(GoalsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve delegar a criação da meta para o GoalsService', async () => {
      const dto = {
        categoryId: 'cat-1',
        title: 'Meta semanal',
        type: GoalType.BINARY,
      };
      const mockResult = {
        id: 'goal-1',
        weekId: 'week-1',
        categoryId: 'cat-1',
        title: 'Meta semanal',
        description: null,
        type: GoalType.BINARY,
        priority: GoalPriority.MEDIUM,
        targetValue: 1,
        currentValue: 0,
        status: GoalStatus.PENDING,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(service, 'create').mockResolvedValue(mockResult);

      const result = await controller.create('week-1', dto);

      expect(service.create).toHaveBeenCalledWith('week-1', dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findByWeekId', () => {
    it('deve delegar a listagem de metas da semana para o GoalsService', async () => {
      const mockGoals = [
        {
          id: 'goal-1',
          weekId: 'week-1',
          categoryId: 'cat-1',
          title: 'Meta semanal',
          description: null,
          type: GoalType.BINARY,
          priority: GoalPriority.MEDIUM,
          targetValue: 1,
          currentValue: 0,
          status: GoalStatus.PENDING,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(service, 'findByWeekId').mockResolvedValue(mockGoals);

      const result = await controller.findByWeekId('week-1');

      expect(service.findByWeekId).toHaveBeenCalledWith('week-1', undefined);
      expect(result).toEqual(mockGoals);
    });
  });
});
