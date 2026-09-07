import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GoalStatus, GoalType, WeekStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MetricsService } from '../metrics/metrics.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReportsService } from '../reports/reports.service.js';
import { REPORT_SCHEMA_VERSION } from '../reports/reports.types.js';
import { WeeksService } from './weeks.service.js';

describe('WeeksService', () => {
  let service: WeeksService;
  let prismaService: PrismaService;
  let reportsService: ReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeksService,
        MetricsService,
        {
          provide: ReportsService,
          useValue: {
            create: vi.fn(),
            findByWeekId: vi.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            week: {
              create: vi.fn(),
              findFirst: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
            },
            goal: {
              findMany: vi.fn(),
            },
            category: {
              findMany: vi.fn(),
            },
            $transaction: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WeeksService>(WeeksService);
    prismaService = module.get<PrismaService>(PrismaService);
    reportsService = module.get<ReportsService>(ReportsService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma semana em DRAFT com endDate calculado para startDate + 6 dias', async () => {
      const mockCreated = {
        id: 'week-1',
        startDate: new Date('2026-09-07T00:00:00.000Z'),
        endDate: new Date('2026-09-13T00:00:00.000Z'),
        status: WeekStatus.DRAFT,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prismaService.week, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prismaService.week, 'create').mockResolvedValue(mockCreated);

      const result = await service.create({ startDate: '2026-09-07' });

      expect(prismaService.week.findFirst).toHaveBeenCalledWith({
        where: {
          startDate: { lte: new Date(Date.UTC(2026, 8, 13)) },
          endDate: { gte: new Date(Date.UTC(2026, 8, 7)) },
        },
      });
      expect(prismaService.week.create).toHaveBeenCalledWith({
        data: {
          startDate: new Date(Date.UTC(2026, 8, 7)),
          endDate: new Date(Date.UTC(2026, 8, 13)),
          status: WeekStatus.DRAFT,
        },
      });
      expect(result).toEqual(mockCreated);
    });

    it('deve lancar ConflictException quando houver sobreposicao de periodo', async () => {
      const existingWeek = {
        id: 'existing-week',
        startDate: new Date('2026-09-07T00:00:00.000Z'),
        endDate: new Date('2026-09-13T00:00:00.000Z'),
        status: WeekStatus.DRAFT,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prismaService.week, 'findFirst').mockResolvedValue(existingWeek);

      await expect(service.create({ startDate: '2026-09-10' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lancar BadRequestException se a data do calendario for invalida', async () => {
      await expect(service.create({ startDate: '2026-02-30' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('deve listar semanas ordenadas por startDate descendente', async () => {
      const mockWeeks = [
        {
          id: 'week-1',
          startDate: new Date('2026-09-07'),
          endDate: new Date('2026-09-13'),
          status: WeekStatus.DRAFT,
          closedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(prismaService.week, 'findMany').mockResolvedValue(mockWeeks);

      const result = await service.findAll();

      expect(prismaService.week.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { startDate: 'desc' },
      });
      expect(result).toEqual(mockWeeks);
    });

    it('deve filtrar por status quando o parametro for informado', async () => {
      vi.spyOn(prismaService.week, 'findMany').mockResolvedValue([]);

      await service.findAll({ status: WeekStatus.ACTIVE });

      expect(prismaService.week.findMany).toHaveBeenCalledWith({
        where: { status: WeekStatus.ACTIVE },
        orderBy: { startDate: 'desc' },
      });
    });
  });

  describe('findById', () => {
    it('deve buscar semana por id com sucesso', async () => {
      const mockWeek = {
        id: 'week-1',
        startDate: new Date('2026-09-07'),
        endDate: new Date('2026-09-13'),
        status: WeekStatus.DRAFT,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);

      const result = await service.findById('week-1');

      expect(prismaService.week.findUnique).toHaveBeenCalledWith({
        where: { id: 'week-1' },
      });
      expect(result).toEqual(mockWeek);
    });

    it('deve lancar NotFoundException se a semana nao existir', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(null);

      await expect(service.findById('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('activate', () => {
    it('deve ativar com sucesso uma semana em DRAFT quando nao houver semana ativa', async () => {
      const draftWeek = {
        id: 'week-1',
        startDate: new Date('2026-09-07'),
        endDate: new Date('2026-09-13'),
        status: WeekStatus.DRAFT,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const activatedWeek = {
        ...draftWeek,
        status: WeekStatus.ACTIVE,
      };

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(draftWeek);
      vi.spyOn(prismaService.week, 'findFirst').mockResolvedValue(null);
      vi.spyOn(prismaService.week, 'update').mockResolvedValue(activatedWeek);

      const result = await service.activate('week-1');

      expect(prismaService.week.findFirst).toHaveBeenCalledWith({
        where: {
          status: WeekStatus.ACTIVE,
          id: { not: 'week-1' },
        },
      });
      expect(prismaService.week.update).toHaveBeenCalledWith({
        where: { id: 'week-1' },
        data: { status: WeekStatus.ACTIVE },
      });
      expect(result).toEqual(activatedWeek);
    });

    it('deve lancar NotFoundException se a semana nao existir', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(null);

      await expect(service.activate('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lancar ConflictException se a semana ja estiver ACTIVE', async () => {
      const activeWeek = {
        id: 'week-1',
        startDate: new Date('2026-09-07'),
        endDate: new Date('2026-09-13'),
        status: WeekStatus.ACTIVE,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(activeWeek);

      await expect(service.activate('week-1')).rejects.toThrow(
        new ConflictException('A semana já está ativa.'),
      );
    });

    it('deve lancar ConflictException se a semana estiver CLOSED', async () => {
      const closedWeek = {
        id: 'week-1',
        startDate: new Date('2026-09-07'),
        endDate: new Date('2026-09-13'),
        status: WeekStatus.CLOSED,
        closedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(closedWeek);

      await expect(service.activate('week-1')).rejects.toThrow(
        new ConflictException('Semanas fechadas não podem ser reativadas.'),
      );
    });

    it('deve lancar ConflictException se ja existir outra semana ACTIVE', async () => {
      const draftWeek = {
        id: 'week-2',
        startDate: new Date('2026-09-14'),
        endDate: new Date('2026-09-20'),
        status: WeekStatus.DRAFT,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const existingActiveWeek = {
        id: 'week-1',
        startDate: new Date('2026-09-07'),
        endDate: new Date('2026-09-13'),
        status: WeekStatus.ACTIVE,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(draftWeek);
      vi.spyOn(prismaService.week, 'findFirst').mockResolvedValue(existingActiveWeek);

      await expect(service.activate('week-2')).rejects.toThrow(
        new ConflictException(
          'Já existe uma semana ativa no momento. Feche-a antes de ativar uma nova semana.',
        ),
      );
    });
  });

  describe('getSummary', () => {
    const mockWeek = {
      id: 'week-1',
      startDate: new Date('2026-09-07T00:00:00.000Z'),
      endDate: new Date('2026-09-13T00:00:00.000Z'),
      status: WeekStatus.ACTIVE,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockCategories = [
      { id: 'cat-1', name: 'Saúde', position: 0, isActive: true },
      { id: 'cat-2', name: 'Estudos', position: 1, isActive: true },
      { id: 'cat-3', name: 'Lazer', position: 2, isActive: true },
    ];

    it('deve retornar o resumo da semana com métricas consolidadas e por categoria', async () => {
      const mockGoals = [
        {
          id: 'goal-1',
          weekId: 'week-1',
          categoryId: 'cat-1',
          title: 'Correr 10km',
          type: GoalType.QUANTITY,
          targetValue: 10,
          currentValue: 10,
          status: GoalStatus.COMPLETED,
        },
        {
          id: 'goal-2',
          weekId: 'week-1',
          categoryId: 'cat-1',
          title: 'Beber água',
          type: GoalType.BINARY,
          targetValue: 1,
          currentValue: 0,
          status: GoalStatus.PENDING,
        },
        {
          id: 'goal-3',
          weekId: 'week-1',
          categoryId: 'cat-2',
          title: 'Ler livro',
          type: GoalType.QUANTITY,
          targetValue: 20,
          currentValue: 10,
          status: GoalStatus.IN_PROGRESS,
        },
      ];

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.goal, 'findMany').mockResolvedValue(mockGoals as any);
      vi.spyOn(prismaService.category, 'findMany').mockResolvedValue(mockCategories as any);

      const summary = await service.getSummary('week-1');

      expect(prismaService.week.findUnique).toHaveBeenCalledWith({
        where: { id: 'week-1' },
      });
      expect(prismaService.goal.findMany).toHaveBeenCalledWith({
        where: { weekId: 'week-1' },
        orderBy: { createdAt: 'asc' },
      });
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ isActive: true }, { goals: { some: { weekId: 'week-1' } } }],
        },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      });

      // Total de metas: 3 (1 concluída, 1 pendente 0%, 1 parcial 50%)
      // Completion: 1 / 3 = 33.33%
      // Progress: (100 + 0 + 50) / 3 = 50%
      expect(summary.totalGoals).toBe(3);
      expect(summary.completedGoals).toBe(1);
      expect(summary.completionRate).toBe(33.33);
      expect(summary.progressRate).toBe(50);
      expect(summary.week.id).toBe('week-1');

      expect(summary.categories).toHaveLength(3);

      const catSaude = summary.categories.find((c) => c.categoryId === 'cat-1');
      expect(catSaude).toEqual({
        categoryId: 'cat-1',
        categoryName: 'Saúde',
        totalGoals: 2,
        completedGoals: 1,
        completionRate: 50,
        progressRate: 50,
      });

      const catEstudos = summary.categories.find((c) => c.categoryId === 'cat-2');
      expect(catEstudos).toEqual({
        categoryId: 'cat-2',
        categoryName: 'Estudos',
        totalGoals: 1,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 50,
      });

      const catLazer = summary.categories.find((c) => c.categoryId === 'cat-3');
      expect(catLazer).toEqual({
        categoryId: 'cat-3',
        categoryName: 'Lazer',
        totalGoals: 0,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 0,
      });
    });

    it('deve retornar métricas zeradas quando a semana não possuir metas', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(mockWeek);
      vi.spyOn(prismaService.goal, 'findMany').mockResolvedValue([]);
      vi.spyOn(prismaService.category, 'findMany').mockResolvedValue(mockCategories as any);

      const summary = await service.getSummary('week-1');

      expect(summary.totalGoals).toBe(0);
      expect(summary.completedGoals).toBe(0);
      expect(summary.completionRate).toBe(0);
      expect(summary.progressRate).toBe(0);
      expect(summary.categories).toHaveLength(3);
      expect(summary.categories.every((c) => c.totalGoals === 0)).toBe(true);
    });

    it('deve lançar NotFoundException se a semana não existir', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(null);

      await expect(service.getSummary('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('close', () => {
    const activeWeek = {
      id: 'week-1',
      startDate: new Date('2026-09-07T00:00:00.000Z'),
      endDate: new Date('2026-09-13T00:00:00.000Z'),
      status: WeekStatus.ACTIVE,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockGoals = [
      {
        id: 'goal-1',
        weekId: 'week-1',
        categoryId: 'cat-1',
        title: 'Meta 1',
        description: 'Desc 1',
        type: GoalType.BINARY,
        priority: 'HIGH',
        targetValue: 1,
        currentValue: 1,
        status: GoalStatus.COMPLETED,
        completedAt: new Date('2026-09-08T10:00:00.000Z'),
        category: { id: 'cat-1', name: 'Saúde' },
      },
      {
        id: 'goal-2',
        weekId: 'week-1',
        categoryId: 'cat-1',
        title: 'Meta 2',
        description: null,
        type: GoalType.QUANTITY,
        priority: 'MEDIUM',
        targetValue: 10,
        currentValue: 5,
        status: GoalStatus.IN_PROGRESS,
        completedAt: null,
        category: { id: 'cat-1', name: 'Saúde' },
      },
    ];

    const mockCategories = [
      { id: 'cat-1', name: 'Saúde', position: 0, isActive: true },
    ];

    it('deve fechar uma semana ACTIVE com sucesso, atualizando status para CLOSED e persistindo relatório via transação', async () => {
      const closedWeek = {
        ...activeWeek,
        status: WeekStatus.CLOSED,
        closedAt: new Date(),
      };

      const mockTx = {
        goal: {
          findMany: vi.fn().mockResolvedValue(mockGoals),
        },
        category: {
          findMany: vi.fn().mockResolvedValue(mockCategories),
        },
        week: {
          update: vi.fn().mockResolvedValue(closedWeek),
        },
      };

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(activeWeek);
      vi.spyOn(prismaService, '$transaction').mockImplementation(async (cb: any) => cb(mockTx));
      vi.spyOn(reportsService, 'create').mockResolvedValue({
        id: 'report-1',
        weekId: 'week-1',
        version: REPORT_SCHEMA_VERSION,
        snapshot: {} as any,
        generatedAt: new Date(),
      });

      const result = await service.close('week-1');

      expect(prismaService.week.findUnique).toHaveBeenCalledWith({
        where: { id: 'week-1' },
      });
      expect(mockTx.goal.findMany).toHaveBeenCalledWith({
        where: { weekId: 'week-1' },
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(mockTx.category.findMany).toHaveBeenCalledWith({
        where: {
          OR: [{ isActive: true }, { goals: { some: { weekId: 'week-1' } } }],
        },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      });
      expect(mockTx.week.update).toHaveBeenCalledWith({
        where: { id: 'week-1' },
        data: {
          status: WeekStatus.CLOSED,
          closedAt: expect.any(Date),
        },
      });
      expect(reportsService.create).toHaveBeenCalledWith(
        'week-1',
        expect.objectContaining({
          version: REPORT_SCHEMA_VERSION,
          generatedAt: expect.any(String),
          totalGoals: 2,
          completedGoals: 1,
          completionRate: 50,
          progressRate: 75,
          goals: expect.arrayContaining([
            expect.objectContaining({
              id: 'goal-1',
              title: 'Meta 1',
              status: GoalStatus.COMPLETED,
              categoryName: 'Saúde',
            }),
            expect.objectContaining({
              id: 'goal-2',
              title: 'Meta 2',
              status: GoalStatus.IN_PROGRESS,
              categoryName: 'Saúde',
            }),
          ]),
        }),
        REPORT_SCHEMA_VERSION,
        mockTx,
      );
      expect(result).toEqual(closedWeek);
    });

    it('deve lançar NotFoundException quando a semana não existir', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(null);

      await expect(service.close('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve lançar ConflictException quando a semana já estiver CLOSED', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue({
        ...activeWeek,
        status: WeekStatus.CLOSED,
      });

      await expect(service.close('week-1')).rejects.toThrow(
        new ConflictException('A semana já está fechada.'),
      );
    });

    it('deve lançar ConflictException quando a semana estiver em DRAFT', async () => {
      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue({
        ...activeWeek,
        status: WeekStatus.DRAFT,
      });

      await expect(service.close('week-1')).rejects.toThrow(
        new ConflictException(
          'Apenas semanas com status ACTIVE podem ser fechadas. Status atual: DRAFT.',
        ),
      );
    });

    it('deve propagar erro e abortar transação se a persistência do relatório falhar', async () => {
      const mockTx = {
        goal: {
          findMany: vi.fn().mockResolvedValue(mockGoals),
        },
        category: {
          findMany: vi.fn().mockResolvedValue(mockCategories),
        },
        week: {
          update: vi.fn().mockResolvedValue({ ...activeWeek, status: WeekStatus.CLOSED }),
        },
      };

      vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(activeWeek);
      vi.spyOn(prismaService, '$transaction').mockImplementation(async (cb: any) => cb(mockTx));
      vi.spyOn(reportsService, 'create').mockRejectedValue(
        new Error('Erro ao salvar relatório'),
      );

      await expect(service.close('week-1')).rejects.toThrow(
        'Erro ao salvar relatório',
      );
    });
  });
});

