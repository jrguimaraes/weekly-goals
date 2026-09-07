import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SwaggerModule } from '@nestjs/swagger';
import { describe, expect, it, vi } from 'vitest';
import { AppModule } from './app.module.js';
import { createSwaggerDocument, setupSwagger } from './swagger.js';

describe('Swagger / OpenAPI Configuration', () => {
  it('deve gerar o documento OpenAPI com metadados e tags corretas', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');

    const document = createSwaggerDocument(app);

    expect(document).toBeDefined();
    expect(document.info.title).toBe('Weekly Goals API');
    expect(document.info.version).toBe('1.0.0');
    expect(document.tags).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: 'Health' }),
        expect.objectContaining({ name: 'Categories' }),
        expect.objectContaining({ name: 'Weeks' }),
        expect.objectContaining({ name: 'Goals' }),
        expect.objectContaining({ name: 'Reports' }),
      ]),
    );

    // Verifica se as rotas principais foram documentadas no OpenAPI
    expect(document.paths).toHaveProperty('/api/health');
    expect(document.paths).toHaveProperty('/api/categories');
    expect(document.paths).toHaveProperty('/api/weeks');
    expect(document.paths).toHaveProperty('/api/goals/{id}');
    expect(document.paths).toHaveProperty('/api/weeks/{id}/report');

    await app.close();
  });

  it('deve configurar o SwaggerModule no endpoint api/docs', () => {
    const mockApp = {} as INestApplication;
    const setupSpy = vi.spyOn(SwaggerModule, 'setup').mockImplementation(() => {});
    const createDocSpy = vi
      .spyOn(SwaggerModule, 'createDocument')
      .mockReturnValue({ openapi: '3.0.0', info: { title: 'Test', version: '1.0' }, paths: {} });

    setupSwagger(mockApp);

    expect(createDocSpy).toHaveBeenCalled();
    expect(setupSpy).toHaveBeenCalledWith(
      'api/docs',
      mockApp,
      expect.objectContaining({ openapi: '3.0.0' }),
    );
  });
});
