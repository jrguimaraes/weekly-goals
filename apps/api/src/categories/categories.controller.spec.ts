import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CategoriesController } from './categories.controller.js';
import { CategoriesService } from './categories.service.js';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

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
            update: vi.fn(),
            archive: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  it('deve delegar a criacao de categoria para o CategoriesService', async () => {
    const dto = { name: 'Trabalho', description: 'Metas da empresa', position: 1 };
    const expected = {
      id: 'cat-1',
      name: 'Trabalho',
      description: 'Metas da empresa',
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(service, 'create').mockResolvedValue(expected);

    const result = await controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(expected);
  });

  it('deve delegar a listagem de categorias para o CategoriesService', async () => {
    const query = { isActive: true };
    const expected = [
      {
        id: 'cat-1',
        name: 'Saúde',
        description: null,
        position: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    vi.spyOn(service, 'findAll').mockResolvedValue(expected);

    const result = await controller.findAll(query);

    expect(service.findAll).toHaveBeenCalledWith(query);
    expect(result).toEqual(expected);
  });

  it('deve delegar a busca de categoria por id para o CategoriesService', async () => {
    const expected = {
      id: 'cat-1',
      name: 'Estudos',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(service, 'findById').mockResolvedValue(expected);

    const result = await controller.findById('cat-1');

    expect(service.findById).toHaveBeenCalledWith('cat-1');
    expect(result).toEqual(expected);
  });

  it('deve delegar a atualizacao de categoria para o CategoriesService', async () => {
    const dto = { name: 'Finanças' };
    const expected = {
      id: 'cat-1',
      name: 'Finanças',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(service, 'update').mockResolvedValue(expected);

    const result = await controller.update('cat-1', dto);

    expect(service.update).toHaveBeenCalledWith('cat-1', dto);
    expect(result).toEqual(expected);
  });

  it('deve delegar o arquivamento de categoria para o CategoriesService', async () => {
    const expected = {
      id: 'cat-1',
      name: 'Projetos Antigos',
      description: null,
      position: 0,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(service, 'archive').mockResolvedValue(expected);

    const result = await controller.archive('cat-1');

    expect(service.archive).toHaveBeenCalledWith('cat-1');
    expect(result).toEqual(expected);
  });
});
