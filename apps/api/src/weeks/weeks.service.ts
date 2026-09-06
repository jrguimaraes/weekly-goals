import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Week, WeekStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
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
  constructor(private readonly prisma: PrismaService) {}

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
}
