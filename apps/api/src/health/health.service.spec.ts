import { ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { HealthService } from './health.service.js';

describe('HealthService', () => {
  let service: HealthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: {
            $queryRaw: vi.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve retornar status ok e database up quando o banco responder com sucesso', async () => {
    vi.spyOn(prismaService, '$queryRaw').mockResolvedValue([{ 1: 1 }]);

    const result = await service.check();

    expect(result.status).toBe('ok');
    expect(result.database.status).toBe('up');
    expect(result.timestamp).toBeDefined();
  });

  it('deve lancar ServiceUnavailableException quando o banco falhar', async () => {
    vi.spyOn(prismaService, '$queryRaw').mockRejectedValue(new Error('Connection timeout'));

    await expect(service.check()).rejects.toThrow(ServiceUnavailableException);

    try {
      await service.check();
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      const err = error as ServiceUnavailableException;
      const response = err.getResponse() as Record<string, unknown>;
      expect(response.status).toBe('error');
      const db = response.database as Record<string, unknown>;
      expect(db.status).toBe('down');
      expect(db.message).toBe('Connection timeout');
    }
  });
});
