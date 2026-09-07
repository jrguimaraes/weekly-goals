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
              update: vi.fn(),
              delete: vi.fn(),
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

  describe('update', () => {
    const mockWeekDraft = {
      id: 'week-1',
      startDate: new Date('2026-09-07'),
      endDate: new Date('2026-09-13'),
      status: WeekStatus.DRAFT,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockWeekActive = {
      ...mockWeekDraft,
      status: WeekStatus.ACTIVE,
    };

    const mockWeekClosed = {
      ...mockWeekDraft,
      status: WeekStatus.CLOSED,
      closedAt: new Date(),
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

    const mockGoalQuantity = {
      id: 'goal-1',
      weekId: 'week-1',
      categoryId: 'cat-1',
      title: 'Correr 10km',
      description: 'Na praia',
      type: GoalType.QUANTITY,
      priority: GoalPriority.MEDIUM,
      targetValue: 10,
      currentValue: 5,
      status: GoalStatus.IN_PROGRESS,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      week: mockWeekDraft,
      category: mockCategory,
    };

    it('deve atualizar com sucesso titulo e descricao de uma meta em semana DRAFT', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoalQuantity);
      vi.spyOn(prismaService.goal, 'update').mockResolvedValue({
        ...mockGoalQuantity,
        title: 'Correr 12km',
        description: 'No parque',
      });

      const result = await service.update('goal-1', {
        title: '  Correr 12km  ',
        description: '  No parque  ',
      });

      expect(prismaService.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        data: {
          title: 'Correr 12km',
          description: 'No parque',
        },
        include: { category: true },
      });
      expect(result.title).toBe('Correr 12km');
    });

    it('deve permitir atualizar meta em semana ACTIVE', async () => {
      const goalInActiveWeek = {
        ...mockGoalQuantity,
        week: mockWeekActive,
      };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(goalInActiveWeek);
      vi.spyOn(prismaService.goal, 'update').mockResolvedValue({
        ...goalInActiveWeek,
        priority: GoalPriority.HIGH,
      });

      const result = await service.update('goal-1', {
        priority: GoalPriority.HIGH,
      });

      expect(prismaService.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        data: { priority: GoalPriority.HIGH },
        include: { category: true },
      });
      expect(result.priority).toBe(GoalPriority.HIGH);
    });

    it('deve rejeitar atualizacao em semana CLOSED com ConflictException', async () => {
      const goalInClosedWeek = {
        ...mockGoalQuantity,
        week: mockWeekClosed,
      };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(goalInClosedWeek);

      await expect(
        service.update('goal-1', { title: 'Novo título' }),
      ).rejects.toThrow(ConflictException);
    });

    it('deve lancar NotFoundException se a meta nao existir ao atualizar', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('inexistente', { title: 'Novo título' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve atualizar categoria quando ela existir e estiver ativa', async () => {
      const newCategory = {
        id: 'cat-2',
        name: 'Estudos',
        description: null,
        position: 1,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoalQuantity);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(newCategory);
      vi.spyOn(prismaService.goal, 'update').mockResolvedValue({
        ...mockGoalQuantity,
        categoryId: 'cat-2',
        category: newCategory,
      });

      const result = await service.update('goal-1', { categoryId: 'cat-2' });

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-2' },
      });
      expect(prismaService.goal.update).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        data: { categoryId: 'cat-2' },
        include: { category: true },
      });
      expect(result.categoryId).toBe('cat-2');
    });

    it('deve lancar NotFoundException ao tentar associar categoria inexistente', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoalQuantity);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

      await expect(
        service.update('goal-1', { categoryId: 'cat-inexistente' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lancar BadRequestException ao tentar associar categoria inativa', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoalQuantity);
      vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue({
        ...mockCategory,
        isActive: false,
      });

      await expect(
        service.update('goal-1', { categoryId: 'cat-1' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar targetValue diferente de 1 para meta BINARY', async () => {
      const mockGoalBinary = {
        ...mockGoalQuantity,
        type: GoalType.BINARY,
        targetValue: 1,
        currentValue: 0,
        status: GoalStatus.PENDING,
      };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoalBinary);

      await expect(
        service.update('goal-1', { targetValue: 5 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve rejeitar targetValue menor ou igual a zero para meta QUANTITY', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoalQuantity);

      await expect(
        service.update('goal-1', { targetValue: 0 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve ajustar status para COMPLETED quando targetValue for reduzido para menor ou igual a currentValue', async () => {
      // currentValue é 5, novo targetValue é 4 -> meta concluída
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoalQuantity);
      vi.spyOn(prismaService.goal, 'update').mockImplementation(async (args) => ({
        ...mockGoalQuantity,
        ...args.data,
      } as any));

      const result = await service.update('goal-1', { targetValue: 4 });

      expect(result.status).toBe(GoalStatus.COMPLETED);
      expect(result.targetValue).toBe(4);
      expect(result.completedAt).toBeInstanceOf(Date);
    });

    it('deve ajustar status para IN_PROGRESS e limpar completedAt quando targetValue for aumentado acima de currentValue', async () => {
      // meta estava COMPLETED com currentValue 10 e targetValue 10
      const completedGoal = {
        ...mockGoalQuantity,
        targetValue: 10,
        currentValue: 10,
        status: GoalStatus.COMPLETED,
        completedAt: new Date(),
      };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(completedGoal);
      vi.spyOn(prismaService.goal, 'update').mockImplementation(async (args) => ({
        ...completedGoal,
        ...args.data,
      } as any));

      const result = await service.update('goal-1', { targetValue: 15 });

      expect(result.status).toBe(GoalStatus.IN_PROGRESS);
      expect(result.targetValue).toBe(15);
      expect(result.completedAt).toBeNull();
    });

    it('deve manter status PENDING e completedAt nulo quando currentValue for 0', async () => {
      const pendingGoal = {
        ...mockGoalQuantity,
        currentValue: 0,
        status: GoalStatus.PENDING,
        completedAt: null,
      };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(pendingGoal);
      vi.spyOn(prismaService.goal, 'update').mockImplementation(async (args) => ({
        ...pendingGoal,
        ...args.data,
      } as any));

      const result = await service.update('goal-1', { targetValue: 20 });

      expect(result.status).toBe(GoalStatus.PENDING);
      expect(result.targetValue).toBe(20);
      expect(result.completedAt).toBeNull();
    });
  });

  describe('delete', () => {
    const mockWeekDraft = {
      id: 'week-1',
      startDate: new Date('2026-09-07'),
      endDate: new Date('2026-09-13'),
      status: WeekStatus.DRAFT,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockWeekActive = {
      ...mockWeekDraft,
      status: WeekStatus.ACTIVE,
    };

    const mockWeekClosed = {
      ...mockWeekDraft,
      status: WeekStatus.CLOSED,
      closedAt: new Date(),
    };

    const mockGoal = {
      id: 'goal-1',
      weekId: 'week-1',
      categoryId: 'cat-1',
      title: 'Meta para remover',
      description: null,
      type: GoalType.BINARY,
      priority: GoalPriority.LOW,
      targetValue: 1,
      currentValue: 0,
      status: GoalStatus.PENDING,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      week: mockWeekDraft,
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

    it('deve remover meta de semana em DRAFT com sucesso', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);
      vi.spyOn(prismaService.goal, 'delete').mockResolvedValue(mockGoal);

      const result = await service.delete('goal-1');

      expect(prismaService.goal.findUnique).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        include: { week: true },
      });
      expect(prismaService.goal.delete).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        include: { category: true },
      });
      expect(result).toEqual(mockGoal);
    });

    it('deve remover meta de semana em ACTIVE com sucesso', async () => {
      const activeGoal = { ...mockGoal, week: mockWeekActive };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(activeGoal);
      vi.spyOn(prismaService.goal, 'delete').mockResolvedValue(activeGoal);

      const result = await service.delete('goal-1');

      expect(result).toEqual(activeGoal);
    });

    it('deve rejeitar remocao de meta em semana CLOSED com ConflictException', async () => {
      const closedGoal = { ...mockGoal, week: mockWeekClosed };
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(closedGoal);

      await expect(service.delete('goal-1')).rejects.toThrow(ConflictException);
      expect(prismaService.goal.delete).not.toHaveBeenCalled();
    });

    it('deve lancar NotFoundException ao tentar remover meta inexistente', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(null);

      await expect(service.delete('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve permitir chamar remove como alias de delete', async () => {
      vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue(mockGoal);
      vi.spyOn(prismaService.goal, 'delete').mockResolvedValue(mockGoal);

      const result = await service.remove('goal-1');

      expect(result).toEqual(mockGoal);
    });
  });
});
