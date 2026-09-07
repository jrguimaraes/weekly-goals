import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WeekStatus } from '@prisma/client';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Weeks (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

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
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );
    await app.init();

    prisma = app.get<PrismaService>(PrismaService);
    await prisma.week.deleteMany();
  });

  afterEach(async () => {
    await prisma.week.deleteMany();
    await app.close();
  });

  describe('POST /api/weeks', () => {
    it('deve criar uma semana em DRAFT com intervalo correto de 7 dias e retornar 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.status).toBe('DRAFT');
      expect(response.body.closedAt).toBeNull();

      const startDate = new Date(response.body.startDate);
      const endDate = new Date(response.body.endDate);

      expect(startDate.toISOString().slice(0, 10)).toBe('2026-09-07');
      expect(endDate.toISOString().slice(0, 10)).toBe('2026-09-13');
    });

    it('deve rejeitar criacao com sobreposicao de periodo e retornar 409 Conflict', async () => {
      await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-10' })
        .expect(409);

      expect(response.body.message).toContain('sobrepõe');
    });

    it('deve rejeitar formato de data invalido e retornar 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '07/09/2026' })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('AAAA-MM-DD')]),
      );
    });

    it('deve rejeitar data de calendario inexistente e retornar 400 Bad Request', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-02-30' })
        .expect(400);

      expect(response.body.message).toContain('Data de calendário inválida');
    });

    it('deve rejeitar payload sem startDate e retornar 400 Bad Request', async () => {
      await request(app.getHttpServer())
        .post('/api/weeks')
        .send({})
        .expect(400);
    });
  });

  describe('GET /api/weeks', () => {
    it('deve listar semanas ordenadas por startDate descendente', async () => {
      await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-14' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get('/api/weeks')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].startDate).toContain('2026-09-14');
      expect(response.body[1].startDate).toContain('2026-09-07');
    });

    it('deve filtrar semanas por status quando informado', async () => {
      await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      const responseDraft = await request(app.getHttpServer())
        .get('/api/weeks?status=DRAFT')
        .expect(200);

      expect(responseDraft.body).toHaveLength(1);

      const responseActive = await request(app.getHttpServer())
        .get('/api/weeks?status=ACTIVE')
        .expect(200);

      expect(responseActive.body).toHaveLength(0);
    });
  });

  describe('GET /api/weeks/:id', () => {
    it('deve retornar semana por id quando existente', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .get(`/api/weeks/${created.body.id}`)
        .expect(200);

      expect(response.body.id).toBe(created.body.id);
      expect(response.body.status).toBe('DRAFT');
    });

    it('deve retornar 404 quando a semana nao existir', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/weeks/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.message).toContain('não encontrada');
    });
  });

  describe('POST /api/weeks/:id/activate', () => {
    it('deve ativar uma semana em DRAFT com sucesso e retornar 200', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/api/weeks/${created.body.id}/activate`)
        .expect(200);

      expect(response.body.id).toBe(created.body.id);
      expect(response.body.status).toBe('ACTIVE');

      const inDb = await prisma.week.findUnique({
        where: { id: created.body.id },
      });
      expect(inDb?.status).toBe(WeekStatus.ACTIVE);
    });

    it('deve retornar 404 quando tentar ativar semana inexistente', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/weeks/00000000-0000-0000-0000-000000000000/activate')
        .expect(404);

      expect(response.body.message).toContain('não encontrada');
    });

    it('deve rejeitar reativacao de semana ja ACTIVE e retornar 409 Conflict', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/weeks/${created.body.id}/activate`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .post(`/api/weeks/${created.body.id}/activate`)
        .expect(409);

      expect(response.body.message).toBe('A semana já está ativa.');
    });

    it('deve rejeitar ativacao de semana CLOSED e retornar 409 Conflict', async () => {
      const closedWeek = await prisma.week.create({
        data: {
          startDate: new Date('2026-09-07T00:00:00.000Z'),
          endDate: new Date('2026-09-13T00:00:00.000Z'),
          status: WeekStatus.CLOSED,
          closedAt: new Date(),
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/weeks/${closedWeek.id}/activate`)
        .expect(409);

      expect(response.body.message).toBe('Semanas fechadas não podem ser reativadas.');
    });

    it('deve rejeitar ativacao se ja existir outra semana ACTIVE e retornar 409 Conflict', async () => {
      const week1 = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-07' })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/weeks/${week1.body.id}/activate`)
        .expect(200);

      const week2 = await request(app.getHttpServer())
        .post('/api/weeks')
        .send({ startDate: '2026-09-14' })
        .expect(201);

      const response = await request(app.getHttpServer())
        .post(`/api/weeks/${week2.body.id}/activate`)
        .expect(409);

      expect(response.body.message).toContain('Já existe uma semana ativa no momento');

      const week2InDb = await prisma.week.findUnique({
        where: { id: week2.body.id },
      });
      expect(week2InDb?.status).toBe(WeekStatus.DRAFT);
    });
  });
});
