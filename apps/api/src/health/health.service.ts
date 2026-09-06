import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

export interface HealthCheckResult {
  status: 'ok' | 'error';
  timestamp: string;
  database: {
    status: 'up' | 'down';
    message?: string;
  };
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async check(): Promise<HealthCheckResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: {
          status: 'up',
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Database check failed';
      throw new ServiceUnavailableException({
        status: 'error',
        timestamp: new Date().toISOString(),
        database: {
          status: 'down',
          message,
        },
      });
    }
  }
}
