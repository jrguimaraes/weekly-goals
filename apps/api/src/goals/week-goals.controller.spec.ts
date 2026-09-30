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
            getImportableFromPreviousWeek: vi.fn(),
            importFromPreviousWeek: vi.fn(),
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

  describe('getImportableFromPreviousWeek', () => {
    it('deve delegar a busca de metas importáveis da semana anterior para o GoalsService', async () => {
      const mockResponse = {
        previousWeek: {
          id: 'prev-1',
          startDate: new Date('2026-09-22'),
          endDate: new Date('2026-09-28'),
        },
        goals: [
          {
            id: 'g-1',
            title: 'Meta 1',
            description: null,
            type: GoalType.BINARY,
            priority: GoalPriority.HIGH,
            targetValue: 1,
            categoryId: 'cat-1',
            category: { id: 'cat-1', name: 'Saúde', isActive: true },
            isAlreadyPresent: false,
          },
        ],
      };

      vi.spyOn(service, 'getImportableFromPreviousWeek').mockResolvedValue(mockResponse);

      const result = await controller.getImportableFromPreviousWeek('week-1');

      expect(service.getImportableFromPreviousWeek).toHaveBeenCalledWith('week-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('importFromPreviousWeek', () => {
    it('deve delegar a importação de metas da semana anterior para o GoalsService', async () => {
      const dto = { goalIds: ['g-1'] };
      const mockImported = [
        {
          id: 'new-g1',
          weekId: 'week-1',
          categoryId: 'cat-1',
          title: 'Meta 1',
          description: null,
          type: GoalType.BINARY,
          priority: GoalPriority.HIGH,
          targetValue: 1,
          currentValue: 0,
          status: GoalStatus.PENDING,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(service, 'importFromPreviousWeek').mockResolvedValue(mockImported);

      const result = await controller.importFromPreviousWeek('week-1', dto);

      expect(service.importFromPreviousWeek).toHaveBeenCalledWith('week-1', dto);
      expect(result).toEqual(mockImported);
    });
  });
});
