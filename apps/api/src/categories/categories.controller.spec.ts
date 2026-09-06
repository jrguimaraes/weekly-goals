import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            create: vi.fn(),
            findAll: vi.fn(),
            findById: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });
});
