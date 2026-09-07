import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { ReportsService } from './reports.service.js';
import { REPORT_SCHEMA_VERSION, ReportSnapshot } from './reports.types.js';

describe('ReportsService', () => {
  let service: ReportsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: PrismaService,
          useValue: {
            weekReport: {
              create: vi.fn(),
              findUnique: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  const mockSnapshot: ReportSnapshot = {
    version: 1,
    generatedAt: new Date().toISOString(),
    week: {
      id: 'week-1',
      startDate: new Date('2026-09-07T00:00:00.000Z'),
      endDate: new Date('2026-09-13T00:00:00.000Z'),
      status: 'CLOSED',
      closedAt: new Date(),
    },
    totalGoals: 2,
    completedGoals: 2,
    completionRate: 100,
    progressRate: 100,
    metrics: {
      totalGoals: 2,
      completedGoals: 2,
      completionRate: 100,
      progressRate: 100,
    },
    categories: [
      {
        categoryId: 'cat-1',
        categoryName: 'Saúde',
        totalGoals: 2,
        completedGoals: 2,
        completionRate: 100,
        progressRate: 100,
      },
    ],
    goals: [],
  };

  describe('create', () => {
    it('deve criar e persistir o relatório com sucesso quando não existir', async () => {
      const mockCreatedReport = {
        id: 'report-1',
        weekId: 'week-1',
        version: REPORT_SCHEMA_VERSION,
        snapshot: mockSnapshot,
        generatedAt: new Date(),
      };

      vi.spyOn(prismaService.weekReport, 'findUnique').mockResolvedValue(null);
      vi.spyOn(prismaService.weekReport, 'create').mockResolvedValue(mockCreatedReport as any);

      const result = await service.create('week-1', mockSnapshot);

      expect(prismaService.weekReport.findUnique).toHaveBeenCalledWith({
        where: { weekId: 'week-1' },
      });
      expect(prismaService.weekReport.create).toHaveBeenCalledWith({
        data: {
          weekId: 'week-1',
          version: REPORT_SCHEMA_VERSION,
          snapshot: mockSnapshot,
        },
      });
      expect(result).toEqual(mockCreatedReport);
    });

    it('deve rejeitar criação com ConflictException se já existir relatório para a semana', async () => {
      const existingReport = {
        id: 'report-1',
        weekId: 'week-1',
        version: 1,
        snapshot: mockSnapshot,
        generatedAt: new Date(),
      };

      vi.spyOn(prismaService.weekReport, 'findUnique').mockResolvedValue(existingReport as any);

      await expect(service.create('week-1', mockSnapshot)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaService.weekReport.create).not.toHaveBeenCalled();
    });

    it('deve suportar uso de cliente transacional personalizado', async () => {
      const mockTx = {
        weekReport: {
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 'report-tx',
            weekId: 'week-1',
            version: 1,
            snapshot: mockSnapshot,
            generatedAt: new Date(),
          }),
        },
      };

      const result = await service.create(
        'week-1',
        mockSnapshot,
        REPORT_SCHEMA_VERSION,
        mockTx as any,
      );

      expect(mockTx.weekReport.findUnique).toHaveBeenCalledWith({
        where: { weekId: 'week-1' },
      });
      expect(mockTx.weekReport.create).toHaveBeenCalledWith({
        data: {
          weekId: 'week-1',
          version: REPORT_SCHEMA_VERSION,
          snapshot: mockSnapshot,
        },
      });
      expect(result.id).toBe('report-tx');
    });
  });

  describe('findByWeekId', () => {
    it('deve retornar o relatório da semana quando existente', async () => {
      const mockReport = {
        id: 'report-1',
        weekId: 'week-1',
        version: 1,
        snapshot: mockSnapshot,
        generatedAt: new Date(),
      };

      vi.spyOn(prismaService.weekReport, 'findUnique').mockResolvedValue(mockReport as any);

      const result = await service.findByWeekId('week-1');

      expect(prismaService.weekReport.findUnique).toHaveBeenCalledWith({
        where: { weekId: 'week-1' },
      });
      expect(result).toEqual(mockReport);
    });

    it('deve lançar NotFoundException quando o relatório não for encontrado', async () => {
      vi.spyOn(prismaService.weekReport, 'findUnique').mockResolvedValue(null);

      await expect(service.findByWeekId('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
