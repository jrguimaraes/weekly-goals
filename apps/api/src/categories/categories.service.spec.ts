import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { CategoriesService } from './categories.service.js';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: {
            category: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  it('deve criar uma categoria com sucesso aplicando trim nos campos', async () => {
    const mockCategory = {
      id: 'cat-1',
      name: 'Trabalho',
      description: 'Metas profissionais',
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.category, 'create').mockResolvedValue(mockCategory);

    const result = await service.create({
      name: '  Trabalho  ',
      description: '  Metas profissionais  ',
      position: 1,
    });

    expect(prismaService.category.create).toHaveBeenCalledWith({
      data: {
        name: 'Trabalho',
        description: 'Metas profissionais',
        position: 1,
      },
    });
    expect(result).toEqual(mockCategory);
  });

  it('deve listar categorias com ordenacao deterministica', async () => {
    const mockCategories = [
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

    vi.spyOn(prismaService.category, 'findMany').mockResolvedValue(mockCategories);

    const result = await service.findAll();

    expect(prismaService.category.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
    expect(result).toEqual(mockCategories);
  });

  it('deve listar categorias filtrando por isActive quando informado', async () => {
    vi.spyOn(prismaService.category, 'findMany').mockResolvedValue([]);

    await service.findAll({ isActive: true });

    expect(prismaService.category.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  });

  it('deve buscar categoria por id com sucesso', async () => {
    const mockCategory = {
      id: 'cat-1',
      name: 'Estudos',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(mockCategory);

    const result = await service.findById('cat-1');

    expect(prismaService.category.findUnique).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
    });
    expect(result).toEqual(mockCategory);
  });

  it('deve lancar NotFoundException se a categoria nao existir no findById', async () => {
    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

    await expect(service.findById('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('deve atualizar categoria com sucesso aplicando trim', async () => {
    const existing = {
      id: 'cat-1',
      name: 'Trabalho',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updated = {
      ...existing,
      name: 'Carreira',
      position: 2,
    };

    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(existing);
    vi.spyOn(prismaService.category, 'update').mockResolvedValue(updated);

    const result = await service.update('cat-1', {
      name: '  Carreira  ',
      position: 2,
    });

    expect(prismaService.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: {
        name: 'Carreira',
        position: 2,
      },
    });
    expect(result).toEqual(updated);
  });

  it('deve lancar NotFoundException ao tentar atualizar categoria inexistente', async () => {
    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

    await expect(
      service.update('inexistente', { name: 'Novo Nome' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('deve arquivar categoria via soft delete alterando isActive para false', async () => {
    const existing = {
      id: 'cat-1',
      name: 'Trabalho',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const archived = {
      ...existing,
      isActive: false,
    };

    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(existing);
    vi.spyOn(prismaService.category, 'update').mockResolvedValue(archived);

    const result = await service.archive('cat-1');

    expect(prismaService.category.update).toHaveBeenCalledWith({
      where: { id: 'cat-1' },
      data: { isActive: false },
    });
    expect(result.isActive).toBe(false);
  });

  it('deve lancar NotFoundException ao tentar arquivar categoria inexistente', async () => {
    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(null);

    await expect(service.archive('inexistente')).rejects.toThrow(
      NotFoundException,
    );
  });
});
