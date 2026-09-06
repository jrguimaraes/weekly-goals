import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  GoalPriority,
  GoalStatus,
  GoalType,
  WeekStatus,
} from '@prisma/client';
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
              create: vi.fn(),
            },
            week: {
              findUnique: vi.fn(),
            },
            category: {
              findUnique: vi.fn(),
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

  describe('create', () => {
    const mockWeek = {
      id: 'week-1',
      startDate: new Date('2026-09-07'),
      endDate: new Date('2026-09-13'),
      status: WeekStatus.DRAFT,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCategory = {
      id: 'cat-1',
      name: 'Saúde',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve criar uma meta BINARY com targetValue fixado em 1 e status PENDING', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);

      const createdGoal = {
        id: 'goal-1',
        weekId: 'week-1',
        categoryId: 'cat-1',
        title: 'Beber 2L de água diariamente',
        description: 'Manter hidratação',
        type: GoalType.BINARY,
        priority: GoalPriority.MEDIUM,
        targetValue: 1,
        currentValue: 0,
        status: GoalStatus.PENDING,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: mockCategory,
      };

      vi.spyOn(prismaService.goal, 'create').mockResolvedValue(createdGoal);

      const result = await service.create('week-1', {
        categoryId: 'cat-1',
        title: 'Beber 2L de água diariamente',
        description: 'Manter hidratação',
        type: GoalType.BINARY,
      });

      expect(prismaService.goal.create).toHaveBeenCalledWith({
        data: {
          weekId: 'week-1',
          categoryId: 'cat-1',
          title: 'Beber 2L de água diariamente',
          description: 'Manter hidratação',
          type: GoalType.BINARY,
          priority: GoalPriority.MEDIUM,
          targetValue: 1,
          currentValue: 0,
          status: GoalStatus.PENDING,
        },
        include: {
          category: true,
        },
      });
      expect(result).toEqual(createdGoal);
    });

    it('deve criar uma meta QUANTITY com targetValue e priority especificados', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);

      const createdGoal = {
        id: 'goal-2',
        weekId: 'week-1',
        categoryId: 'cat-1',
        title: 'Correr quilômetros',
        description: null,
        type: GoalType.QUANTITY,
        priority: GoalPriority.HIGH,
        targetValue: 25,
        currentValue: 0,
        status: GoalStatus.PENDING,
        completedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: mockCategory,
      };

      vi.spyOn(prismaService.goal, 'create').mockResolvedValue(createdGoal);

      const result = await service.create('week-1', {
        categoryId: 'cat-1',
        title: 'Correr quilômetros',
        type: GoalType.QUANTITY,
        priority: GoalPriority.HIGH,
        targetValue: 25,
      });

      expect(prismaService.goal.create).toHaveBeenCalledWith({
        data: {
          weekId: 'week-1',
          categoryId: 'cat-1',
          title: 'Correr quilômetros',
          description: null,
          type: GoalType.QUANTITY,
          priority: GoalPriority.HIGH,
          targetValue: 25,
          currentValue: 0,
          status: GoalStatus.PENDING,
        },
        include: {
          category: true,
        },
      });
      expect(result).toEqual(createdGoal);
    });

    it('deve permitir criar metas quando a semana estiver em ACTIVE', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue({
        ...mockWeek,
        status: WeekStatus.ACTIVE,
      });
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);
      vi.spyOn(prismaService.goal, 'create').mockResolvedValue({} as any);

      await service.create('week-1', {
        categoryId: 'cat-1',
        title: 'Meta em semana ativa',
        type: GoalType.BINARY,
      });

      expect(prismaService.goal.create).toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se a semana não existir', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create('week-inexistente', {
          categoryId: 'cat-1',
          title: 'Meta',
          type: GoalType.BINARY,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ConflictException se a semana estiver CLOSED', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue({
        ...mockWeek,
        status: WeekStatus.CLOSED,
      });

      await expect(
        service.create('week-1', {
          categoryId: 'cat-1',
          title: 'Meta',
          type: GoalType.BINARY,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve lançar NotFoundException se a categoria não existir', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

      await expect(
        service.create('week-1', {
          categoryId: 'cat-inexistente',
          title: 'Meta',
          type: GoalType.BINARY,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se a categoria estiver inativa', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue({
        ...mockCategory,
        isActive: false,
      });

      await expect(
        service.create('week-1', {
          categoryId: 'cat-1',
          title: 'Meta',
          type: GoalType.BINARY,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se meta BINARY for informada com targetValue !== 1', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);

      await expect(
        service.create('week-1', {
          categoryId: 'cat-1',
          title: 'Meta',
          type: GoalType.BINARY,
          targetValue: 2,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve aceitar meta BINARY com targetValue explicitamente igual a 1', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);
      vi.spyOn(prismaService.goal, 'create').mockResolvedValue({} as any);

      await service.create('week-1', {
        categoryId: 'cat-1',
        title: 'Meta BINARY com 1',
        type: GoalType.BINARY,
        targetValue: 1,
      });

      expect(prismaService.goal.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            targetValue: 1,
          }),
        }),
      );
    });

    it('deve lançar BadRequestException se meta QUANTITY não tiver targetValue', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);

      await expect(
        service.create('week-1', {
          categoryId: 'cat-1',
          title: 'Meta QUANTITY sem target',
          type: GoalType.QUANTITY,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se meta QUANTITY tiver targetValue <= 0', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);

      await expect(
        service.create('week-1', {
          categoryId: 'cat-1',
          title: 'Meta QUANTITY com target 0',
          type: GoalType.QUANTITY,
          targetValue: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });
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
    const mockWeek = {
      id: 'week-1',
      startDate: new Date('2026-09-07'),
      endDate: new Date('2026-09-13'),
      status: WeekStatus.DRAFT,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve listar metas vinculadas à semana ordenadas por createdAt asc', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);

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

      expect(prismaService.week.findUnique).toHaveBeenCalledWith({
        where: { id: 'week-1' },
      });
      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: { weekId: 'week-1' },
        orderBy: { createdAt: 'asc' },
        include: { category: true },
      });
      expect(result).toEqual(mockGoals);
    });

    it('deve filtrar metas por categoryId e status quando fornecidos', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.goal, 'findMany').mockResolvedValue([]);

      await service.findByWeekId('week-1', {
        categoryId: 'cat-1',
        status: GoalStatus.PENDING,
      });

      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: {
          weekId: 'week-1',
          categoryId: 'cat-1',
          status: GoalStatus.PENDING,
        },
        orderBy: { createdAt: 'asc' },
        include: { category: true },
      });
    });

    it('deve lançar NotFoundException se a semana não existir ao listar metas', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(null);

      await expect(service.findByWeekId('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
