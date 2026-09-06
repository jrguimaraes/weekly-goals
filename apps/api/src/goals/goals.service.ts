import { Injectable, NotFoundException } from '@nestjs/common';
import { Goal } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

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

  async findByWeekId(weekId: string): Promise<Goal[]> {
    return this.prisma.goal.findMany({
      where: { weekId },
      orderBy: { createdAt: 'asc' },
      include: {
        category: true,
      },
    });
  }
}
