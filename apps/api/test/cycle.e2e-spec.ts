import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

describe('Weekly Goals Lifecycle (e2e)', () => {
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
    await prisma.weekReport.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.week.deleteMany();
    await prisma.category.deleteMany();
  });

  afterEach(async () => {
    await prisma.weekReport.deleteMany();
    await prisma.goal.deleteMany();
    await prisma.week.deleteMany();
    await prisma.category.deleteMany();
    await app.close();
  });

  it('deve executar o ciclo completo de ponta a ponta e garantir imutabilidade após o fechamento', async () => {
    // 1. Criar categorias
    const catSaudeRes = await request(app.getHttpServer())
      .post('/api/categories')
      .send({ name: 'Saúde', description: 'Metas de bem-estar', position: 1 })
      .expect(201);
    const catSaudeId = catSaudeRes.body.id;

    const catEstudosRes = await request(app.getHttpServer())
      .post('/api/categories')
      .send({ name: 'Estudos', description: 'Metas acadêmicas', position: 2 })
      .expect(201);
    const catEstudosId = catEstudosRes.body.id;

    // 2. Criar semana em DRAFT
    const weekRes = await request(app.getHttpServer())
      .post('/api/weeks')
      .send({ startDate: '2026-09-07' })
      .expect(201);
    const weekId = weekRes.body.id;
    expect(weekRes.body.status).toBe('DRAFT');

    // 3. Criar metas na semana
    const goal1Res = await request(app.getHttpServer())
      .post(`/api/weeks/${weekId}/goals`)
      .send({
        title: 'Treinar 5 vezes',
        type: 'BINARY',
        targetValue: 1,
        categoryId: catSaudeId,
        priority: 'HIGH',
      })
      .expect(201);
    const goal1Id = goal1Res.body.id;
    expect(goal1Res.body.status).toBe('PENDING');

    const goal2Res = await request(app.getHttpServer())
      .post(`/api/weeks/${weekId}/goals`)
      .send({
        title: 'Ler 50 páginas de livro',
        type: 'QUANTITY',
        targetValue: 50,
        categoryId: catEstudosId,
        priority: 'MEDIUM',
      })
      .expect(201);
    const goal2Id = goal2Res.body.id;
    expect(goal2Res.body.status).toBe('PENDING');

    // 4. Ativar semana
    const activateRes = await request(app.getHttpServer())
      .post(`/api/weeks/${weekId}/activate`)
      .expect(200);
    expect(activateRes.body.status).toBe('ACTIVE');

    // 5. Acompanhar progresso das metas
    const progressGoal1Res = await request(app.getHttpServer())
      .patch(`/api/goals/${goal1Id}/progress`)
      .send({ currentValue: 1 })
      .expect(200);
    expect(progressGoal1Res.body.status).toBe('COMPLETED');
    expect(progressGoal1Res.body.completedAt).toBeDefined();

    const progressGoal2Res = await request(app.getHttpServer())
      .patch(`/api/goals/${goal2Id}/progress`)
      .send({ currentValue: 25 })
      .expect(200);
    expect(progressGoal2Res.body.status).toBe('IN_PROGRESS');
    expect(progressGoal2Res.body.completedAt).toBeNull();

    // 6. Consultar resumo da semana em andamento
    const summaryRes = await request(app.getHttpServer())
      .get(`/api/weeks/${weekId}/summary`)
      .expect(200);

    expect(summaryRes.body.totalGoals).toBe(2);
    expect(summaryRes.body.completedGoals).toBe(1);
    expect(summaryRes.body.completionRate).toBe(50);
    expect(summaryRes.body.progressRate).toBe(75);
    expect(summaryRes.body.categories).toHaveLength(2);

    const catSaudeMetric = summaryRes.body.categories.find(
      (c: any) => c.categoryId === catSaudeId,
    );
    expect(catSaudeMetric).toMatchObject({
      categoryId: catSaudeId,
      categoryName: 'Saúde',
      totalGoals: 1,
      completedGoals: 1,
      completionRate: 100,
      progressRate: 100,
    });

    const catEstudosMetric = summaryRes.body.categories.find(
      (c: any) => c.categoryId === catEstudosId,
    );
    expect(catEstudosMetric).toMatchObject({
      categoryId: catEstudosId,
      categoryName: 'Estudos',
      totalGoals: 1,
      completedGoals: 0,
      completionRate: 0,
      progressRate: 50,
    });

    // 7. Validar tentativa prematura de relatório em semana ACTIVE
    const prematureReportRes = await request(app.getHttpServer())
      .get(`/api/weeks/${weekId}/report`)
      .expect(400);
    expect(prematureReportRes.body.message).toContain('Apenas semanas fechadas');

    // 8. Fechar a semana atomicamente
    const closeRes = await request(app.getHttpServer())
      .post(`/api/weeks/${weekId}/close`)
      .expect(200);
    expect(closeRes.body.status).toBe('CLOSED');
    expect(closeRes.body.closedAt).toBeDefined();

    // 9. Consultar relatório consolidado imutável
    const reportRes = await request(app.getHttpServer())
      .get(`/api/weeks/${weekId}/report`)
      .expect(200);

    expect(reportRes.body.version).toBe(1);
    expect(reportRes.body.totalGoals).toBe(2);
    expect(reportRes.body.completedGoals).toBe(1);
    expect(reportRes.body.completionRate).toBe(50);
    expect(reportRes.body.progressRate).toBe(75);
    expect(reportRes.body.goals).toHaveLength(2);
    expect(reportRes.body.categories).toHaveLength(2);

    // 10. Validar todas as regras de imutabilidade após o fechamento
    // 10.1 Não pode adicionar metas em semana fechada
    const addGoalClosedRes = await request(app.getHttpServer())
      .post(`/api/weeks/${weekId}/goals`)
      .send({
        title: 'Meta tardia',
        type: 'BINARY',
        targetValue: 1,
        categoryId: catSaudeId,
      })
      .expect(409);
    expect(addGoalClosedRes.body.message).toContain('semana fechada');

    // 10.2 Não pode editar meta de semana fechada
    const editGoalClosedRes = await request(app.getHttpServer())
      .patch(`/api/goals/${goal1Id}`)
      .send({ title: 'Título alterado' })
      .expect(409);
    expect(editGoalClosedRes.body.message).toContain('semana fechada');

    // 10.3 Não pode atualizar progresso de meta em semana fechada
    const updateProgressClosedRes = await request(app.getHttpServer())
      .patch(`/api/goals/${goal2Id}/progress`)
      .send({ currentValue: 50 })
      .expect(409);
    expect(updateProgressClosedRes.body.message).toContain('semana fechada');

    // 10.4 Não pode remover meta de semana fechada
    const deleteGoalClosedRes = await request(app.getHttpServer())
      .delete(`/api/goals/${goal1Id}`)
      .expect(409);
    expect(deleteGoalClosedRes.body.message).toContain('semana fechada');

    // 10.5 Não pode reativar semana fechada
    const reactivateRes = await request(app.getHttpServer())
      .post(`/api/weeks/${weekId}/activate`)
      .expect(409);
    expect(reactivateRes.body.message).toBe('Semanas fechadas não podem ser reativadas.');

    // 10.6 Não pode fechar novamente uma semana já fechada
    const recloseRes = await request(app.getHttpServer())
      .post(`/api/weeks/${weekId}/close`)
      .expect(409);
    expect(recloseRes.body.message).toBe('A semana já está fechada.');
  });
});
