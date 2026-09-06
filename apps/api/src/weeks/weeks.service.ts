import { Injectable, NotFoundException } from '@nestjs/common';
import { Week } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class WeeksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Week[]> {
    return this.prisma.week.findMany({
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
}
