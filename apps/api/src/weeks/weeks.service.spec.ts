import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WeekStatus } from '@prisma/client';
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
              create: vi.fn(),
              findFirst: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
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
});
