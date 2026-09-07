import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Week, WeekStatus } from '@prisma/client';
import { MetricsService } from '../metrics/metrics.service.js';
import { WeekSummaryResponse } from '../metrics/metrics.types.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReportsService } from '../reports/reports.service.js';
import {
  GoalSnapshot,
  REPORT_SCHEMA_VERSION,
  ReportSnapshot,
} from '../reports/reports.types.js';
import { CreateWeekDto } from './dto/create-week.dto.js';
import { ListWeeksQueryDto } from './dto/list-weeks-query.dto.js';

function parseCalendarDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) {
    throw new BadRequestException('Formato de data inválido.');
  }

  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new BadRequestException(`Data de calendário inválida: "${dateStr}".`);
  }

  return date;
}

function calculateEndDate(startDate: Date): Date {
  const endDate = new Date(startDate.getTime());
  endDate.setUTCDate(endDate.getUTCDate() + 6);
  return endDate;
}

@Injectable()
export class WeeksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metricsService: MetricsService,
    private readonly reportsService: ReportsService,
  ) {}

  async create(dto: CreateWeekDto): Promise<Week> {
    const startDate = parseCalendarDate(dto.startDate);
    const endDate = calculateEndDate(startDate);

    const overlapping = await this.prisma.week.findFirst({
      where: {
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'Já existe uma semana cadastrada que sobrepõe o período informado.',
      );
    }

    return this.prisma.week.create({
      data: {
        startDate,
        endDate,
        status: WeekStatus.DRAFT,
      },
    });
  }

  async findAll(query?: ListWeeksQueryDto): Promise<Week[]> {
    return this.prisma.week.findMany({
      where: query?.status ? { status: query.status } : undefined,
      orderBy: { startDate: 'desc' },
    });
  }

  async findById(id: string): Promise<Week> {
    const week = await this.prisma.week.findUnique({
      where: { id },
    });

    if (!week) {
      throw new NotFoundException(`Semana com id "${id}" não encontrada.`);
    }

    return week;
  }

  async activate(id: string): Promise<Week> {
    const week = await this.findById(id);

    if (week.status === WeekStatus.ACTIVE) {
      throw new ConflictException('A semana já está ativa.');
    }

    if (week.status === WeekStatus.CLOSED) {
      throw new ConflictException('Semanas fechadas não podem ser reativadas.');
    }

    if (week.status !== WeekStatus.DRAFT) {
      throw new ConflictException(
        `Apenas semanas em DRAFT podem ser ativadas. Status atual: ${week.status}.`,
      );
    }

    const activeWeek = await this.prisma.week.findFirst({
      where: {
        status: WeekStatus.ACTIVE,
        id: { not: id },
      },
    });

    if (activeWeek) {
      throw new ConflictException(
        'Já existe uma semana ativa no momento. Feche-a antes de ativar uma nova semana.',
      );
    }

    return this.prisma.week.update({
      where: { id },
      data: {
        status: WeekStatus.ACTIVE,
      },
    });
  }

  async close(id: string): Promise<Week> {
    const week = await this.findById(id);

    if (week.status === WeekStatus.CLOSED) {
      throw new ConflictException('A semana já está fechada.');
    }

    if (week.status !== WeekStatus.ACTIVE) {
      throw new ConflictException(
        `Apenas semanas com status ACTIVE podem ser fechadas. Status atual: ${week.status}.`,
      );
    }

    const closedAt = new Date();

    return this.prisma.$transaction(async (tx) => {
      const goals = await tx.goal.findMany({
        where: { weekId: id },
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      });

      const categories = await tx.category.findMany({
        where: {
          OR: [{ isActive: true }, { goals: { some: { weekId: id } } }],
        },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      });

      const closedWeekState: Week = {
        ...week,
        status: WeekStatus.CLOSED,
        closedAt,
      };

      const summary = this.metricsService.buildWeekSummary(
        closedWeekState,
        goals,
        categories,
      );

      const goalSnapshots: GoalSnapshot[] = goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        type: goal.type,
        priority: goal.priority,
        targetValue: goal.targetValue,
        currentValue: goal.currentValue,
        status: goal.status,
        completedAt: goal.completedAt ? goal.completedAt.toISOString() : null,
        categoryId: goal.categoryId,
        categoryName: goal.category?.name,
      }));

      const snapshot: ReportSnapshot = {
        ...summary,
        version: REPORT_SCHEMA_VERSION,
        generatedAt: closedAt.toISOString(),
        goals: goalSnapshots,
      };

      const updatedWeek = await tx.week.update({
        where: { id },
        data: {
          status: WeekStatus.CLOSED,
          closedAt,
        },
      });

      await this.reportsService.create(id, snapshot, REPORT_SCHEMA_VERSION, tx);

      return updatedWeek;
    });
  }

  async getSummary(id: string): Promise<WeekSummaryResponse> {
    const week = await this.findById(id);

    const goals = await this.prisma.goal.findMany({
      where: { weekId: id },
      orderBy: { createdAt: 'asc' },
    });

    const categories = await this.prisma.category.findMany({
      where: {
        OR: [{ isActive: true }, { goals: { some: { weekId: id } } }],
      },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });

    return this.metricsService.buildWeekSummary(week, goals, categories);
  }
}
