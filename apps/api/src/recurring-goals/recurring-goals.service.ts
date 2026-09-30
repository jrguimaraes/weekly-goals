import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoalPriority, GoalType, RecurringGoal } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRecurringGoalDto } from './dto/create-recurring-goal.dto.js';
import { UpdateRecurringGoalDto } from './dto/update-recurring-goal.dto.js';

@Injectable()
export class RecurringGoalsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<RecurringGoal[]> {
    return this.prisma.recurringGoal.findMany({
      include: {
        category: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(id: string): Promise<RecurringGoal> {
    const recurring = await this.prisma.recurringGoal.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!recurring) {
      throw new NotFoundException(`Meta recorrente com id "${id}" não encontrada.`);
    }

    return recurring;
  }

  async create(dto: CreateRecurringGoalDto): Promise<RecurringGoal> {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com id "${dto.categoryId}" não encontrada.`);
    }

    if (!category.isActive) {
      throw new BadRequestException('Não é possível associar uma meta recorrente a uma categoria inativa.');
    }

    let targetValue: number;

    if (dto.type === GoalType.BINARY) {
      if (dto.targetValue !== undefined && dto.targetValue !== 1) {
        throw new BadRequestException('Para metas do tipo BINARY, targetValue deve ser 1.');
      }
      targetValue = 1;
    } else if (dto.type === GoalType.QUANTITY) {
      if (dto.targetValue === undefined || dto.targetValue === null || dto.targetValue <= 0) {
        throw new BadRequestException(
          'Para metas do tipo QUANTITY, targetValue é obrigatório e deve ser maior que 0.',
        );
      }
      targetValue = dto.targetValue;
    } else {
      throw new BadRequestException('Tipo de meta inválido.');
    }

    const normalizedTitle = dto.title.trim().toLowerCase();
    const existing = await this.prisma.recurringGoal.findMany({
      where: { categoryId: dto.categoryId },
    });

    const match = existing.find(
      (r) => r.title.trim().toLowerCase() === normalizedTitle,
    );

    if (match) {
      return this.prisma.recurringGoal.update({
        where: { id: match.id },
        data: {
          title: dto.title.trim(),
          description: dto.description?.trim() || null,
          type: dto.type,
          priority: dto.priority ?? GoalPriority.MEDIUM,
          targetValue,
          active: dto.active ?? true,
        },
        include: {
          category: true,
        },
      });
    }

    return this.prisma.recurringGoal.create({
      data: {
        categoryId: dto.categoryId,
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        type: dto.type,
        priority: dto.priority ?? GoalPriority.MEDIUM,
        targetValue,
        active: dto.active ?? true,
      },
      include: {
        category: true,
      },
    });
  }

  async update(id: string, dto: UpdateRecurringGoalDto): Promise<RecurringGoal> {
    const recurring = await this.findById(id);

    if (dto.categoryId && dto.categoryId !== recurring.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Categoria com id "${dto.categoryId}" não encontrada.`);
      }

      if (!category.isActive) {
        throw new BadRequestException('Não é possível associar uma meta recorrente a uma categoria inativa.');
      }
    }

    if (dto.targetValue !== undefined) {
      if (recurring.type === GoalType.BINARY && dto.targetValue !== 1) {
        throw new BadRequestException('Para metas do tipo BINARY, targetValue deve ser 1.');
      }
      if (recurring.type === GoalType.QUANTITY && dto.targetValue <= 0) {
        throw new BadRequestException('Para metas do tipo QUANTITY, targetValue deve ser maior que 0.');
      }
    }

    return this.prisma.recurringGoal.update({
      where: { id },
      data: {
        categoryId: dto.categoryId,
        title: dto.title !== undefined ? dto.title.trim() : undefined,
        description: dto.description !== undefined ? dto.description?.trim() || null : undefined,
        priority: dto.priority,
        targetValue: dto.targetValue,
        active: dto.active,
      },
      include: {
        category: true,
      },
    });
  }

  async toggleActive(id: string): Promise<RecurringGoal> {
    const recurring = await this.findById(id);

    return this.prisma.recurringGoal.update({
      where: { id },
      data: {
        active: !recurring.active,
      },
      include: {
        category: true,
      },
    });
  }
}
