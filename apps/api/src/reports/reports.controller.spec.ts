import { BadRequestException, INestApplication, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportsController } from './reports.controller.js';
import { ReportsService } from './reports.service.js';
import { ReportSnapshot } from './reports.types.js';

describe('ReportsController', () => {
  let controller: ReportsController;
  let service: ReportsService;
  let app: INestApplication;

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
    totalGoals: 1,
    completedGoals: 1,
    completionRate: 100,
    progressRate: 100,
    metrics: {
      totalGoals: 1,
      completedGoals: 1,
      completionRate: 100,
      progressRate: 100,
    },
    categories: [
      {
        categoryId: 'cat-1',
        categoryName: 'Saúde',
        totalGoals: 1,
        completedGoals: 1,
        completionRate: 100,
        progressRate: 100,
      },
    ],
    goals: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        {
          provide: ReportsService,
          useValue: {
            getReport: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);

    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('getReport', () => {
    it('deve delegar a consulta do relatório para o ReportsService', async () => {
      vi.spyOn(service, 'getReport').mockResolvedValue(mockSnapshot);

      const result = await controller.getReport('week-1');

      expect(service.getReport).toHaveBeenCalledWith('week-1');
      expect(result).toEqual(mockSnapshot);
    });
  });

  describe('HTTP GET /api/weeks/:id/report', () => {
    it('deve retornar status 200 e o snapshot imutável via HTTP', async () => {
      vi.spyOn(service, 'getReport').mockResolvedValue(mockSnapshot);

      const response = await request(app.getHttpServer())
        .get('/api/weeks/week-1/report')
        .expect(200);

      expect(response.body.version).toBe(1);
      expect(response.body.completionRate).toBe(100);
      expect(response.body.progressRate).toBe(100);
      expect(service.getReport).toHaveBeenCalledWith('week-1');
    });

    it('deve retornar status 400 quando a semana não estiver fechada', async () => {
      vi.spyOn(service, 'getReport').mockRejectedValue(
        new BadRequestException('Apenas semanas fechadas possuem relatório disponível. Status atual: ACTIVE.'),
      );

      const response = await request(app.getHttpServer())
        .get('/api/weeks/week-1/report')
        .expect(400);

      expect(response.body.message).toContain('Apenas semanas fechadas');
    });

    it('deve retornar status 404 quando a semana ou relatório não forem encontrados', async () => {
      vi.spyOn(service, 'getReport').mockRejectedValue(
        new NotFoundException('Semana com id "inexistente" não encontrada.'),
      );

      const response = await request(app.getHttpServer())
        .get('/api/weeks/inexistente/report')
        .expect(404);

      expect(response.body.message).toContain('não encontrada');
    });
  });
});

