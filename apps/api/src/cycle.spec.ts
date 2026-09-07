import { BadRequestException, ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GoalPriority, GoalStatus, GoalType, WeekStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoriesService } from './categories/categories.service.js';
import { GoalsService } from './goals/goals.service.js';
import { MetricsService } from './metrics/metrics.service.js';
import { PrismaService } from './prisma/prisma.service.js';
import { ReportsService } from './reports/reports.service.js';
import { REPORT_SCHEMA_VERSION } from './reports/reports.types.js';
import { WeeksService } from './weeks/weeks.service.js';

describe('Ciclo Completo de Planejamento Semanal (Fluxo Integrado)', () => {
  let categoriesService: CategoriesService;
  let weeksService: WeeksService;
  let goalsService: GoalsService;
  let reportsService: ReportsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        WeeksService,
        GoalsService,
        MetricsService,
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              findFirst: vi.fn(),
            },
            week: {
              create: vi.fn(),
              findFirst: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
            },
            goal: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
            weekReport: {
              create: vi.fn(),
              findUnique: vi.fn(),
            },
            $transaction: vi.fn(),
          },
        },
      ],
    }).compile();

    categoriesService = module.get<CategoriesService>(CategoriesService);
    weeksService = module.get<WeeksService>(WeeksService);
    goalsService = module.get<GoalsService>(GoalsService);
    reportsService = module.get<ReportsService>(ReportsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve simular o ciclo completo de planejamento semanal e confirmar as travas de imutabilidade', async () => {
    // 1. Criação de Categorias
    const catSaude = {
      id: 'cat-saude',
      name: 'Saúde',
      description: 'Atividades físicas',
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const catEstudos = {
      id: 'cat-estudos',
      name: 'Estudos',
      description: 'Leitura e cursos',
      position: 2,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prismaService.category, 'create')
      .mockResolvedValueOnce(catSaude)
      .mockResolvedValueOnce(catEstudos);

    const createdCat1 = await categoriesService.create({ name: 'Saúde', position: 1 });
    const createdCat2 = await categoriesService.create({ name: 'Estudos', position: 2 });
    expect(createdCat1.name).toBe('Saúde');
    expect(createdCat2.name).toBe('Estudos');

    // 2. Criação de Semana (DRAFT)
    const draftWeek = {
      id: 'week-1',
      startDate: new Date('2026-09-07T00:00:00.000Z'),
      endDate: new Date('2026-09-13T00:00:00.000Z'),
      status: WeekStatus.DRAFT,
      closedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.week, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prismaService.week, 'create').mockResolvedValue(draftWeek);

    const createdWeek = await weeksService.create({ startDate: '2026-09-07' });
    expect(createdWeek.status).toBe(WeekStatus.DRAFT);

    // 3. Associação de Metas à Semana
    const goal1 = {
      id: 'goal-1',
      weekId: 'week-1',
      categoryId: 'cat-saude',
      title: 'Treinar 5x',
      description: null,
      type: GoalType.BINARY,
      priority: GoalPriority.HIGH,
      targetValue: 1,
      currentValue: 0,
      status: GoalStatus.PENDING,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: catSaude,
    };

    const goal2 = {
      id: 'goal-2',
      weekId: 'week-1',
      categoryId: 'cat-estudos',
      title: 'Ler 50 páginas',
      description: null,
      type: GoalType.QUANTITY,
      priority: GoalPriority.MEDIUM,
      targetValue: 50,
      currentValue: 0,
      status: GoalStatus.PENDING,
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      category: catEstudos,
    };

    vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(draftWeek);
    vi.spyOn(prismaService.category, 'findUnique')
      .mockResolvedValueOnce(catSaude)
      .mockResolvedValueOnce(catEstudos);
    vi.spyOn(prismaService.goal, 'create')
      .mockResolvedValueOnce(goal1)
      .mockResolvedValueOnce(goal2);

    const createdGoal1 = await goalsService.create('week-1', {
      title: 'Treinar 5x',
      type: GoalType.BINARY,
      targetValue: 1,
      categoryId: 'cat-saude',
      priority: GoalPriority.HIGH,
    });
    const createdGoal2 = await goalsService.create('week-1', {
      title: 'Ler 50 páginas',
      type: GoalType.QUANTITY,
      targetValue: 50,
      categoryId: 'cat-estudos',
      priority: GoalPriority.MEDIUM,
    });

    expect(createdGoal1.status).toBe(GoalStatus.PENDING);
    expect(createdGoal2.status).toBe(GoalStatus.PENDING);

    // 4. Ativação da Semana
    const activeWeek = {
      ...draftWeek,
      status: WeekStatus.ACTIVE,
    };

    vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(draftWeek);
    vi.spyOn(prismaService.week, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prismaService.week, 'update').mockResolvedValue(activeWeek);

    const activatedWeek = await weeksService.activate('week-1');
    expect(activatedWeek.status).toBe(WeekStatus.ACTIVE);

    // 5. Atualização de Progresso das Metas
    const completedGoal1 = {
      ...goal1,
      currentValue: 1,
      status: GoalStatus.COMPLETED,
      completedAt: new Date(),
      week: activeWeek,
    };

    const inProgressGoal2 = {
      ...goal2,
      currentValue: 25,
      status: GoalStatus.IN_PROGRESS,
      completedAt: null,
      week: activeWeek,
    };

    vi.spyOn(prismaService.goal, 'findUnique')
      .mockResolvedValueOnce({ ...goal1, week: activeWeek })
      .mockResolvedValueOnce({ ...goal2, week: activeWeek });
    vi.spyOn(prismaService.goal, 'update')
      .mockResolvedValueOnce(completedGoal1)
      .mockResolvedValueOnce(inProgressGoal2);

    const updatedGoal1 = await goalsService.updateProgress('goal-1', { currentValue: 1 });
    const updatedGoal2 = await goalsService.updateProgress('goal-2', { currentValue: 25 });

    expect(updatedGoal1.status).toBe(GoalStatus.COMPLETED);
    expect(updatedGoal1.completedAt).not.toBeNull();
    expect(updatedGoal2.status).toBe(GoalStatus.IN_PROGRESS);

    // 6. Consulta de Resumo da Semana (Summary)
    vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(activeWeek);
    vi.spyOn(prismaService.goal, 'findMany').mockResolvedValue([completedGoal1, inProgressGoal2]);
    vi.spyOn(prismaService.category, 'findMany').mockResolvedValue([catSaude, catEstudos]);

    const summary = await weeksService.getSummary('week-1');
    expect(summary.totalGoals).toBe(2);
    expect(summary.completedGoals).toBe(1);
    expect(summary.completionRate).toBe(50);
    expect(summary.progressRate).toBe(75);
    expect(summary.categories).toHaveLength(2);

    // 7. Tentativa Prematura de Relatório em Semana ACTIVE
    await expect(reportsService.getReport('week-1')).rejects.toThrow(BadRequestException);

    // 8. Fechamento Atômico da Semana
    const closedDate = new Date();
    const closedWeek = {
      ...activeWeek,
      status: WeekStatus.CLOSED,
      closedAt: closedDate,
    };

    const mockTx = {
      goal: {
        findMany: vi.fn().mockResolvedValue([completedGoal1, inProgressGoal2]),
      },
      category: {
        findMany: vi.fn().mockResolvedValue([catSaude, catEstudos]),
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
      generatedAt: closedDate,
    });

    const finalizedWeek = await weeksService.close('week-1');
    expect(finalizedWeek.status).toBe(WeekStatus.CLOSED);
    expect(finalizedWeek.closedAt).toBeDefined();

    // 9. Consulta de Relatório Persistido Imutável
    const mockReportSnapshot = {
      version: 1,
      generatedAt: closedDate.toISOString(),
      week: {
        id: 'week-1',
        startDate: closedWeek.startDate,
        endDate: closedWeek.endDate,
        status: 'CLOSED',
        closedAt: closedDate,
      },
      totalGoals: 2,
      completedGoals: 1,
      completionRate: 50,
      progressRate: 75,
      metrics: {
        totalGoals: 2,
        completedGoals: 1,
        completionRate: 50,
        progressRate: 75,
      },
      categories: [
        {
          categoryId: 'cat-saude',
          categoryName: 'Saúde',
          totalGoals: 1,
          completedGoals: 1,
          completionRate: 100,
          progressRate: 100,
        },
        {
          categoryId: 'cat-estudos',
          categoryName: 'Estudos',
          totalGoals: 1,
          completedGoals: 0,
          completionRate: 0,
          progressRate: 50,
        },
      ],
      goals: [
        {
          id: 'goal-1',
          title: 'Treinar 5x',
          description: null,
          type: GoalType.BINARY,
          priority: GoalPriority.HIGH,
          targetValue: 1,
          currentValue: 1,
          status: GoalStatus.COMPLETED,
          completedAt: closedDate.toISOString(),
          categoryId: 'cat-saude',
          categoryName: 'Saúde',
        },
        {
          id: 'goal-2',
          title: 'Ler 50 páginas',
          description: null,
          type: GoalType.QUANTITY,
          priority: GoalPriority.MEDIUM,
          targetValue: 50,
          currentValue: 25,
          status: GoalStatus.IN_PROGRESS,
          completedAt: null,
          categoryId: 'cat-estudos',
          categoryName: 'Estudos',
        },
      ],
    };

    vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(closedWeek);
    vi.spyOn(prismaService.weekReport, 'findUnique').mockResolvedValue({
      id: 'report-1',
      weekId: 'week-1',
      version: 1,
      snapshot: mockReportSnapshot as any,
      generatedAt: closedDate,
    });

    const report = await reportsService.getReport('week-1');
    expect(report).toEqual(mockReportSnapshot);
    expect(report.version).toBe(1);
    expect(report.totalGoals).toBe(2);
    expect(report.completedGoals).toBe(1);
    expect(report.completionRate).toBe(50);
    expect(report.progressRate).toBe(75);

    // 10. Validação Rigorosa das Regras de Imutabilidade Após Fechamento
    // 10.1 Não pode adicionar meta em semana fechada
    vi.spyOn(prismaService.week, 'findUnique').mockResolvedValue(closedWeek);
    await expect(
      goalsService.create('week-1', {
        title: 'Meta tardia',
        type: GoalType.BINARY,
        targetValue: 1,
        categoryId: 'cat-saude',
      }),
    ).rejects.toThrow(new ConflictException('Não é possível adicionar metas a uma semana fechada.'));

    // 10.2 Não pode alterar meta de semana fechada
    vi.spyOn(prismaService.goal, 'findUnique').mockResolvedValue({
      ...completedGoal1,
      week: closedWeek,
    });
    await expect(
      goalsService.update('goal-1', { title: 'Título alterado' }),
    ).rejects.toThrow(new ConflictException('Não é possível alterar metas de uma semana fechada.'));

    // 10.3 Não pode alterar progresso de meta de semana fechada
    await expect(
      goalsService.updateProgress('goal-2', { currentValue: 50 }),
    ).rejects.toThrow(
      new ConflictException(
        'Não é possível atualizar o progresso de metas de uma semana fechada.',
      ),
    );

    // 10.4 Não pode remover meta de semana fechada
    await expect(goalsService.delete('goal-1')).rejects.toThrow(
      new ConflictException('Não é possível remover metas de uma semana fechada.'),
    );

    // 10.5 Não pode reativar semana fechada
    await expect(weeksService.activate('week-1')).rejects.toThrow(
      new ConflictException('Semanas fechadas não podem ser reativadas.'),
    );

    // 10.6 Não pode fechar novamente uma semana já fechada
    await expect(weeksService.close('week-1')).rejects.toThrow(
      new ConflictException('A semana já está fechada.'),
    );
  });
});
