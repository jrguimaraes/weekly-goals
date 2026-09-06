import { Test, TestingModule } from '@nestjs/testing';
import { WeekStatus } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { WeeksController } from './weeks.controller.js';
import { WeeksService } from './weeks.service.js';

describe('WeeksController', () => {
  let controller: WeeksController;
  let service: WeeksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeksController],
      providers: [
        {
          provide: WeeksService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
            activate: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<WeeksController>(WeeksController);
    service = module.get<WeeksService>(WeeksService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve delegar a criacao para o WeeksService', async () => {
      const dto = { startDate: '2026-09-07' };
      const mockResult = {
        id: 'week-1',
        startDate: new Date('2026-09-07T00:00:00.000Z'),
        endDate: new Date('2026-09-13T00:00:00.000Z'),
        status: WeekStatus.DRAFT,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(service, 'create').mockResolvedValue(mockResult);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findAll', () => {
    it('deve delegar a listagem para o WeeksService com query', async () => {
      const query = { status: WeekStatus.DRAFT };
      const mockResult = [
        {
          id: 'week-1',
          startDate: new Date('2026-09-07T00:00:00.000Z'),
          endDate: new Date('2026-09-13T00:00:00.000Z'),
          status: WeekStatus.DRAFT,
          closedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.spyOn(service, 'findAll').mockResolvedValue(mockResult);

      const result = await controller.findAll(query);

      expect(service.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findById', () => {
    it('deve delegar a busca por id para o WeeksService', async () => {
      const mockResult = {
        id: 'week-1',
        startDate: new Date('2026-09-07T00:00:00.000Z'),
        endDate: new Date('2026-09-13T00:00:00.000Z'),
        status: WeekStatus.DRAFT,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(service, 'findById').mockResolvedValue(mockResult);

      const result = await controller.findById('week-1');

      expect(service.findById).toHaveBeenCalledWith('week-1');
      expect(result).toEqual(mockResult);
    });
  });

  describe('activate', () => {
    it('deve delegar a ativacao para o WeeksService', async () => {
      const mockResult = {
        id: 'week-1',
        startDate: new Date('2026-09-07T00:00:00.000Z'),
        endDate: new Date('2026-09-13T00:00:00.000Z'),
        status: WeekStatus.ACTIVE,
        closedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.spyOn(service, 'activate').mockResolvedValue(mockResult);

      const result = await controller.activate('week-1');

      expect(service.activate).toHaveBeenCalledWith('week-1');
      expect(result).toEqual(mockResult);
    });
  });
});
