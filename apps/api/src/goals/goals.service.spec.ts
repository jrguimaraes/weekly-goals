import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GoalPriority, GoalStatus, GoalType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { GoalsService } from './goals.service.js';

describe('GoalsService', () => {
  let service: GoalsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: PrismaService,
          useValue: {
            goal: {
              findUnique: vi.fn(),
              findMany: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('deve retornar a meta com categoria vinculada com sucesso', async () => {
      const mockGoal = {
        id: 'goal-1',
        weekId: 'week-1',
        categoryId: 'cat-1',
        title: 'Meta de Teste',
        description: 'Descrição de teste',
        type: GoalType.BINARY,
        priority: GoalPriority.MEDIUM,
        targetValue: 1,
        currentValue: 0,
        status: GoalStatus.PENDING,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: 'cat-1',
          name: 'Saúde',
          description: null,
          position: 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      };

      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);

      const result = await service.findById('goal-1');

      expect(prismaService.goal.findUnique).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        include: { category: true },
      });
      expect(result).toEqual(mockGoal);
    });

    it('deve lançar NotFoundException quando a meta não existir', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByWeekId', () => {
    it('deve listar metas vinculadas à semana ordenadas por createdAt asc', async () => {
      const mockGoals = [
        {
          id: 'goal-1',
          weekId: 'week-1',
          categoryId: 'cat-1',
          title: 'Meta de Teste',
          description: null,
          type: GoalType.QUANTITY,
          priority: GoalPriority.HIGH,
          targetValue: 5,
          currentValue: 2,
          status: GoalStatus.IN_PROGRESS,
          completedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {
            id: 'cat-1',
            name: 'Treino',
            description: null,
            position: 1,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      vi.spyOn(prismaService.goal, 'findMany').mockResolvedValue(mockGoals);

      const result = await service.findByWeekId('week-1');

      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: { weekId: 'week-1' },
        orderBy: { createdAt: 'asc' },
        include: { category: true },
      });
      expect(result).toEqual(mockGoals);
    });
  });
});
