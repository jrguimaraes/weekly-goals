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
import { ListGoalsQueryDto } from './dto/list-goals-query.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';

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

    const targetType = dto.type ?? goal.type;
    let targetValue = goal.targetValue;

    if (targetType === GoalType.BINARY) {
      if (dto.targetValue !== undefined && dto.targetValue !== 1) {
        throw new BadRequestException(
          'Para metas do tipo BINARY, targetValue deve ser 1.',
        );
      }
      targetValue = 1;
    } else if (targetType === GoalType.QUANTITY) {
      if (dto.targetValue !== undefined) {
        if (dto.targetValue <= 0) {
          throw new BadRequestException(
            'Para metas do tipo QUANTITY, targetValue é obrigatório e deve ser maior que 0.',
          );
        }
        targetValue = dto.targetValue;
      }
    } else {
      throw new BadRequestException('Tipo de meta inválido.');
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
      type?: GoalType;
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
    if (dto.type !== undefined) {
      data.type = dto.type;
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
}
