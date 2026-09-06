import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Categories (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeEach(async () => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL ??
      'postgresql://postgres:postgres@localhost:5432/weekly_goals?schema=public';

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
    await prisma.category.deleteMany();
  });

  afterEach(async () => {
    await prisma.category.deleteMany();
    await app.close();
  });

  describe('POST /api/categories', () => {
    it('deve criar uma categoria com sucesso e retornar 201', async () => {
      const payload = {
        name: '  Trabalho  ',
        description: '  Metas profissionais  ',
        position: 1,
      };

      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send(payload)
        .expect(201);

      expect(response.body).toMatchObject({
        name: 'Trabalho',
        description: 'Metas profissionais',
        position: 1,
        isActive: true,
      });
      expect(response.body.id).toBeDefined();
      expect(response.body.createdAt).toBeDefined();
      expect(response.body.updatedAt).toBeDefined();

      const inDb = await prisma.category.findUnique({
        where: { id: response.body.id },
      });
      expect(inDb).not.toBeNull();
      expect(inDb?.name).toBe('Trabalho');
    });

    it('deve criar uma categoria com position padrao 0 quando omitida', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: 'Saúde' })
        .expect(201);

      expect(response.body.position).toBe(0);
      expect(response.body.description).toBeNull();
    });

    it('deve retornar 400 se o nome for vazio ou contiver apenas espacos', async () => {
      const responseEmpty = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: '' })
        .expect(400);

      expect(responseEmpty.body.message).toBeDefined();

      const responseSpaces = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: '    ' })
        .expect(400);

      expect(responseSpaces.body.message).toBeDefined();
    });

    it('deve retornar 400 se position for negativo', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/categories')
        .send({ name: 'Financeiro', position: -1 })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });
  });

  describe('GET /api/categories', () => {
    it('deve listar categorias com ordenacao deterministica por position ascendente', async () => {
      await prisma.category.createMany({
        data: [
          { name: 'Estudos', position: 2 },
          { name: 'Trabalho', position: 0 },
          { name: 'Saúde', position: 1 },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/categories')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].name).toBe('Trabalho');
      expect(response.body[1].name).toBe('Saúde');
      expect(response.body[2].name).toBe('Estudos');
    });

    it('deve permitir filtrar categorias por isActive', async () => {
      await prisma.category.createMany({
        data: [
          { name: 'Ativa', position: 0, isActive: true },
          { name: 'Arquivada', position: 1, isActive: false },
        ],
      });

      const responseActives = await request(app.getHttpServer())
        .get('/api/categories?isActive=true')
        .expect(200);

      expect(responseActives.body).toHaveLength(1);
      expect(responseActives.body[0].name).toBe('Ativa');

      const responseInactives = await request(app.getHttpServer())
        .get('/api/categories?isActive=false')
        .expect(200);

      expect(responseInactives.body).toHaveLength(1);
      expect(responseInactives.body[0].name).toBe('Arquivada');
    });
  });
});
