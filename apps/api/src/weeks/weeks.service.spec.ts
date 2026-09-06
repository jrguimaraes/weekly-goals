import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { WeeksService } from './weeks.service.js';

describe('WeeksService', () => {
  let service: WeeksService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeksService,
        {
          provide: PrismaService,
          useValue: {
            week: {
              findMany: vi.fn(),
              findUnique: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WeeksService>(WeeksService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve listar semanas ordenadas por startDate descendente', async () => {
    const mockWeeks = [
      {
        id: 'week-1',
        startDate: new Date('2026-09-07'),
        endDate: new Date('2026-09-13'),
        status: 'DRAFT' as const,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(prismaService.week, 'findMany').mockResolvedValue(mockWeeks);

    const result = await service.findAll();

    expect(prismaService.week.findMany).toHaveBeenCalledWith({
      orderBy: { startDate: 'desc' },
    });
    expect(result).toEqual(mockWeeks);
  });

  it('deve buscar semana por id com sucesso', async () => {
    const mockWeek = {
      id: 'week-1',
      startDate: new Date('2026-09-07'),
      endDate: new Date('2026-09-13'),
      status: 'DRAFT' as const,
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
