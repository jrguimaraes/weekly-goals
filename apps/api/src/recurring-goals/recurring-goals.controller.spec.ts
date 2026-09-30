import { Test, TestingModule } from '@nestjs/testing';
import { GoalPriority, GoalType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecurringGoalsController } from './recurring-goals.controller.js';
import { RecurringGoalsService } from './recurring-goals.service.js';

describe('RecurringGoalsController', () => {
  let controller: RecurringGoalsController;
  let service: RecurringGoalsService;

  const mockRecurringGoal = {
    id: 'rec-1',
    categoryId: 'cat-1',
    title: 'Estudar Anki',
    description: null,
    type: GoalType.QUANTITY,
    priority: GoalPriority.HIGH,
    targetValue: 5,
    active: true,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
    category: {
      id: 'cat-1',
      name: 'Estudos',
      isActive: true,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecurringGoalsController],
      providers: [
        {
          provide: RecurringGoalsService,
          useValue: {
            findAll: vi.fn(),
            findById: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            toggleActive: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RecurringGoalsController>(RecurringGoalsController);
    service = module.get<RecurringGoalsService>(RecurringGoalsService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve chamar service.findAll e retornar a lista', async () => {
      vi.mocked(service.findAll).mockResolvedValue([mockRecurringGoal as any]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockRecurringGoal]);
    });
  });

  describe('findById', () => {
    it('deve chamar service.findById com id correto', async () => {
      vi.mocked(service.findById).mockResolvedValue(mockRecurringGoal as any);

      const result = await controller.findById('rec-1');

      expect(service.findById).toHaveBeenCalledWith('rec-1');
      expect(result).toEqual(mockRecurringGoal);
    });
  });

  describe('create', () => {
    it('deve chamar service.create com o DTO', async () => {
      const dto = {
        categoryId: 'cat-1',
        title: 'Estudar Anki',
        type: GoalType.QUANTITY,
        targetValue: 5,
      };
      vi.mocked(service.create).mockResolvedValue(mockRecurringGoal as any);

      const result = await controller.create(dto as any);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockRecurringGoal);
    });
  });

  describe('update', () => {
    it('deve chamar service.update com id e DTO', async () => {
      const dto = { targetValue: 10 };
      const updated = { ...mockRecurringGoal, targetValue: 10 };
      vi.mocked(service.update).mockResolvedValue(updated as any);

      const result = await controller.update('rec-1', dto);

      expect(service.update).toHaveBeenCalledWith('rec-1', dto);
      expect(result).toEqual(updated);
    });
  });

  describe('toggleActive', () => {
    it('deve chamar service.toggleActive com o id', async () => {
      const toggled = { ...mockRecurringGoal, active: false };
      vi.mocked(service.toggleActive).mockResolvedValue(toggled as any);

      const result = await controller.toggleActive('rec-1');

      expect(service.toggleActive).toHaveBeenCalledWith('rec-1');
      expect(result).toEqual(toggled);
    });
  });
});
