import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';

describe('HealthController', () => {
  let controller: HealthController;
  let healthService: HealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthService,
          useValue: {
            check: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthService = module.get<HealthService>(HealthService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar a verificacao para o healthService.check', async () => {
    const expected = {
      status: 'ok' as const,
      timestamp: '2026-09-06T18:45:00.000Z',
      database: { status: 'up' as const },
    };
    vi.spyOn(healthService, 'check').mockResolvedValue(expected);

    const result = await controller.check();

    expect(healthService.check).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expected);
  });
});
