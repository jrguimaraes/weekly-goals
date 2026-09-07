import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Health (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/weekly_goals?schema=test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    prismaService = app.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/health (GET) - deve retornar 200 quando o banco estiver disponivel', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);

    expect(response.body).toMatchObject({
      status: 'ok',
      database: {
        status: 'up',
      },
    });
    expect(response.body.timestamp).toBeDefined();
  });

  it('/api/health (GET) - deve retornar 503 quando o banco falhar', async () => {
    vi.spyOn(prismaService, '$queryRaw').mockRejectedValueOnce(
      new Error('Simulated DB failure'),
    );

    const response = await request(app.getHttpServer())
      .get('/api/health')
      .expect(503);

    expect(response.body).toMatchObject({
      status: 'error',
      database: {
        status: 'down',
        message: 'Simulated DB failure',
      },
    });
  });
});
