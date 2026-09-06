import { Test, TestingModule } from '@nestjs/testing';
import { GoalPriority, GoalStatus, GoalType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoalsController } from './goals.controller.js';
import { GoalsService } from './goals.service.js';

describe('GoalsController', () => {
  let controller: GoalsController;
  let service: GoalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [
        {
          provide: GoalsService,
          useValue: {
            findById: vi.fn(),
            findByWeekId: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
    service = module.get<GoalsService>(GoalsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findById', () => {
    it('deve delegar a busca de meta por id para o GoalsService', async () => {
      const mockGoal = {
        id: 'goal-1',
        weekId: 'week-1',
        categoryId: 'cat-1',
        title: 'Correr 10km',
        description: null,
        type: GoalType.QUANTITY,
        priority: GoalPriority.HIGH,
        targetValue: 10,
        currentValue: 0,
        status: GoalStatus.PENDING,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(service, 'findById').mockResolvedValue(mockGoal);

      const result = await controller.findById('goal-1');

      expect(service.findById).toHaveBeenCalledWith('goal-1');
      expect(result).toEqual(mockGoal);
    });
  });
});
