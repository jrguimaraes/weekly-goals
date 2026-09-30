import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Goal,
  GoalPriority,
  GoalStatus,
  GoalType,
  WeekStatus,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { ImportGoalsDto } from './dto/import-goals.dto.js';
import { ListGoalsQueryDto } from './dto/list-goals-query.dto.js';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';

export interface ImportableGoalItem {
  id: string;
  title: string;
  description: string | null;
  type: GoalType;
  priority: GoalPriority;
  targetValue: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
    isActive: boolean;
  };
  isAlreadyPresent: boolean;
}

export interface ImportableGoalsResponse {
  previousWeek: {
    id: string;
    startDate: Date;
    endDate: Date;
  } | null;
  goals: ImportableGoalItem[];
}


@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(weekId: string, dto: CreateGoalDto): Promise<Goal> {
    const week = await this.prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      throw new NotFoundException(`Semana com id "${weekId}" não encontrada.`);
    }

    if (week.status === WeekStatus.CLOSED) {
      throw new ConflictException(
        'Não é possível adicionar metas a uma semana fechada.',
      );
    }

    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Categoria com id "${dto.categoryId}" não encontrada.`,
      );
    }

    if (!category.isActive) {
      throw new BadRequestException(
        'Não é possível associar uma meta a uma categoria inativa.',
      );
    }

    let targetValue: number;

    if (dto.type === GoalType.BINARY) {
      if (dto.targetValue !== undefined && dto.targetValue !== 1) {
        throw new BadRequestException(
          'Para metas do tipo BINARY, targetValue deve ser 1.',
        );
      }
      targetValue = 1;
    } else if (dto.type === GoalType.QUANTITY) {
      if (
        dto.targetValue === undefined ||
        dto.targetValue === null ||
        dto.targetValue <= 0
      ) {
        throw new BadRequestException(
          'Para metas do tipo QUANTITY, targetValue é obrigatório e deve ser maior que 0.',
        );
      }
      targetValue = dto.targetValue;
    } else {
      throw new BadRequestException('Tipo de meta inválido.');
    }

    return this.prisma.goal.create({
      data: {
        weekId,
        categoryId: dto.categoryId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        notes: dto.notes?.trim() || null,
        type: dto.type,
        priority: dto.priority ?? GoalPriority.MEDIUM,
        targetValue,
        currentValue: 0,
        status: GoalStatus.PENDING,
      },
      include: {
        category: true,
      },
    });
  }

  async findById(id: string): Promise<Goal> {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!goal) {
      throw new NotFoundException(`Meta com id "${id}" não encontrada.`);
    }

    return goal;
  }

  async findByWeekId(
    weekId: string,
    query?: ListGoalsQueryDto,
  ): Promise<Goal[]> {
    const week = await this.prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      throw new NotFoundException(`Semana com id "${weekId}" não encontrada.`);
    }

    return this.prisma.goal.findMany({
      where: {
        weekId,
        ...(query?.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query?.status ? { status: query.status } : {}),
      },
      orderBy: { createdAt: 'asc' },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, dto: UpdateGoalDto): Promise<Goal> {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: {
        week: true,
      },
    });

    if (!goal) {
      throw new NotFoundException(`Meta com id "${id}" não encontrada.`);
    }

    if (goal.week.status === WeekStatus.CLOSED) {
      throw new ConflictException(
        'Não é possível alterar metas de uma semana fechada.',
      );
    }

    if (dto.categoryId !== undefined) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(
          `Categoria com id "${dto.categoryId}" não encontrada.`,
        );
      }

      if (!category.isActive) {
        throw new BadRequestException(
          'Não é possível associar uma meta a uma categoria inativa.',
        );
      }
    }

    if (
      (dto as { type?: GoalType }).type !== undefined &&
      (dto as { type?: GoalType }).type !== goal.type
    ) {
      throw new BadRequestException(
        'O tipo da meta não pode ser alterado após a criação.',
      );
    }

    let targetValue = goal.targetValue;

    if (goal.type === GoalType.BINARY) {
      if (dto.targetValue !== undefined && dto.targetValue !== 1) {
        throw new BadRequestException(
          'Para metas do tipo BINARY, targetValue deve ser 1.',
        );
      }
      targetValue = 1;
    } else if (goal.type === GoalType.QUANTITY) {
      if (dto.targetValue !== undefined) {
        if (dto.targetValue <= 0) {
          throw new BadRequestException(
            'Para metas do tipo QUANTITY, targetValue é obrigatório e deve ser maior que 0.',
          );
        }
        targetValue = dto.targetValue;
      }
    }

    let status = goal.status;
    let completedAt = goal.completedAt;

    if (goal.currentValue >= targetValue) {
      status = GoalStatus.COMPLETED;
      completedAt = goal.completedAt ?? new Date();
    } else if (goal.currentValue > 0) {
      status = GoalStatus.IN_PROGRESS;
      completedAt = null;
    } else {
      status = GoalStatus.PENDING;
      completedAt = null;
    }

    const data: {
      categoryId?: string;
      title?: string;
      description?: string | null;
      notes?: string | null;
      priority?: GoalPriority;
      targetValue?: number;
      status?: GoalStatus;
      completedAt?: Date | null;
    } = {};

    if (dto.categoryId !== undefined) {
      data.categoryId = dto.categoryId;
    }
    if (dto.title !== undefined) {
      data.title = dto.title.trim();
    }
    if (dto.description !== undefined) {
      data.description = dto.description ? dto.description.trim() : null;
    }
    if (dto.notes !== undefined) {
      data.notes = dto.notes ? dto.notes.trim() : null;
    }
    if (dto.priority !== undefined) {
      data.priority = dto.priority;
    }
    if (targetValue !== goal.targetValue) {
      data.targetValue = targetValue;
    }
    if (status !== goal.status) {
      data.status = status;
    }
    if (completedAt !== goal.completedAt) {
      data.completedAt = completedAt;
    }

    return this.prisma.goal.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });
  }

  async delete(id: string): Promise<Goal> {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: {
        week: true,
      },
    });

    if (!goal) {
      throw new NotFoundException(`Meta com id "${id}" não encontrada.`);
    }

    if (goal.week.status === WeekStatus.CLOSED) {
      throw new ConflictException(
        'Não é possível remover metas de uma semana fechada.',
      );
    }

    return this.prisma.goal.delete({
      where: { id },
      include: {
        category: true,
      },
    });
  }

  async remove(id: string): Promise<Goal> {
    return this.delete(id);
  }

  async updateProgress(
    id: string,
    dto: UpdateGoalProgressDto,
  ): Promise<Goal> {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
      include: {
        week: true,
      },
    });

    if (!goal) {
      throw new NotFoundException(`Meta com id "${id}" não encontrada.`);
    }

    if (goal.week.status === WeekStatus.CLOSED) {
      throw new ConflictException(
        'Não é possível atualizar o progresso de metas de uma semana fechada.',
      );
    }

    if (goal.type === GoalType.BINARY) {
      if (dto.currentValue !== 0 && dto.currentValue !== 1) {
        throw new BadRequestException(
          'Para metas do tipo BINARY, currentValue deve ser 0 ou 1.',
        );
      }
    } else if (goal.type === GoalType.QUANTITY) {
      if (dto.currentValue < 0) {
        throw new BadRequestException(
          'Para metas do tipo QUANTITY, currentValue deve ser maior ou igual a 0.',
        );
      }
    }

    let status: GoalStatus;
    let completedAt: Date | null;

    if (dto.currentValue >= goal.targetValue) {
      status = GoalStatus.COMPLETED;
      completedAt = goal.completedAt ?? new Date();
    } else if (dto.currentValue > 0) {
      status = GoalStatus.IN_PROGRESS;
      completedAt = null;
    } else {
      status = GoalStatus.PENDING;
      completedAt = null;
    }

    return this.prisma.goal.update({
      where: { id },
      data: {
        currentValue: dto.currentValue,
        status,
        completedAt,
      },
      include: {
        category: true,
      },
    });
  }

  async getImportableFromPreviousWeek(
    weekId: string,
  ): Promise<ImportableGoalsResponse> {
    const week = await this.prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      throw new NotFoundException(`Semana com id "${weekId}" não encontrada.`);
    }

    if (week.status !== WeekStatus.DRAFT) {
      throw new ConflictException(
        'A importação de metas é permitida apenas para semanas em planejamento (DRAFT).',
      );
    }

    const previousWeek = await this.prisma.week.findFirst({
      where: {
        startDate: { lt: week.startDate },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!previousWeek) {
      return {
        previousWeek: null,
        goals: [],
      };
    }

    const previousGoals = await this.prisma.goal.findMany({
      where: { weekId: previousWeek.id },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    const currentGoals = await this.prisma.goal.findMany({
      where: { weekId },
      select: { title: true, categoryId: true },
    });

    const isEquivalent = (prevGoal: { title: string; categoryId: string }) => {
      return currentGoals.some(
        (curr) =>
          curr.categoryId === prevGoal.categoryId &&
          curr.title.trim().toLowerCase() === prevGoal.title.trim().toLowerCase(),
      );
    };

    const goals: ImportableGoalItem[] = previousGoals.map((g) => ({
      id: g.id,
      title: g.title,
      description: g.description,
      type: g.type,
      priority: g.priority,
      targetValue: g.targetValue,
      categoryId: g.categoryId,
      category: {
        id: g.category.id,
        name: g.category.name,
        isActive: g.category.isActive,
      },
      isAlreadyPresent: isEquivalent(g),
    }));

    return {
      previousWeek: {
        id: previousWeek.id,
        startDate: previousWeek.startDate,
        endDate: previousWeek.endDate,
      },
      goals,
    };
  }

  async importFromPreviousWeek(
    weekId: string,
    dto: ImportGoalsDto,
  ): Promise<Goal[]> {
    const week = await this.prisma.week.findUnique({
      where: { id: weekId },
    });

    if (!week) {
      throw new NotFoundException(`Semana com id "${weekId}" não encontrada.`);
    }

    if (week.status !== WeekStatus.DRAFT) {
      throw new ConflictException(
        'A importação de metas é permitida apenas para semanas em planejamento (DRAFT).',
      );
    }

    const previousWeek = await this.prisma.week.findFirst({
      where: {
        startDate: { lt: week.startDate },
      },
      orderBy: { startDate: 'desc' },
    });

    if (!previousWeek) {
      throw new BadRequestException(
        'Nenhuma semana anterior encontrada para importar metas.',
      );
    }

    const sourceGoals = await this.prisma.goal.findMany({
      where: {
        id: { in: dto.goalIds },
        weekId: previousWeek.id,
      },
      include: { category: true },
      orderBy: { createdAt: 'asc' },
    });

    if (sourceGoals.length === 0) {
      throw new NotFoundException(
        'Nenhuma meta válida encontrada para importação na semana anterior.',
      );
    }

    const currentGoals = await this.prisma.goal.findMany({
      where: { weekId },
      select: { title: true, categoryId: true },
    });

    const isEquivalent = (prevGoal: { title: string; categoryId: string }) => {
      return currentGoals.some(
        (curr) =>
          curr.categoryId === prevGoal.categoryId &&
          curr.title.trim().toLowerCase() === prevGoal.title.trim().toLowerCase(),
      );
    };

    const goalsToImport = sourceGoals.filter((g) => !isEquivalent(g));

    if (goalsToImport.length === 0) {
      return [];
    }

    for (const g of goalsToImport) {
      if (!g.category.isActive) {
        throw new BadRequestException(
          `A categoria "${g.category.name}" da meta "${g.title}" está inativa.`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const createdGoals: Goal[] = [];
      for (const source of goalsToImport) {
        const created = await tx.goal.create({
          data: {
            weekId,
            categoryId: source.categoryId,
            title: source.title,
            description: source.description,
            notes: null,
            type: source.type,
            priority: source.priority,
            targetValue: source.targetValue,
            currentValue: 0,
            status: GoalStatus.PENDING,
            completedAt: null,
          },
          include: {
            category: true,
          },
        });
        createdGoals.push(created);
      }
      return createdGoals;
    });
  }
}
