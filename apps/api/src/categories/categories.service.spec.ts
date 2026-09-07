import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '@prisma/client';
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
              findFirst: vi.fn(),
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

    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prismaService.category, 'create').mockResolvedValue(mockCategory);

    const result = await service.create({
      name: '  Trabalho  ',
      description: '  Metas profissionais  ',
      position: 1,
    });

    expect(prismaService.category.findFirst).toHaveBeenCalledWith({
      where: {
        name: { equals: 'Trabalho', mode: 'insensitive' },
      },
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

  it('deve lancar ConflictException ao tentar criar categoria com nome duplicado', async () => {
    const existing = {
      id: 'cat-1',
      name: 'Trabalho',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(existing);

    await expect(
      service.create({ name: 'Trabalho' }),
    ).rejects.toThrow(new ConflictException('Já existe uma categoria com este nome.'));
  });

  it('deve lancar ConflictException ao tentar criar categoria com variacao de maiusculas/minusculas', async () => {
    const existing = {
      id: 'cat-1',
      name: 'Trabalho',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(existing);

    await expect(
      service.create({ name: 'trabalho' }),
    ).rejects.toThrow(ConflictException);
  });

  it('deve lancar ConflictException se prisma retornar erro P2002 no create', async () => {
    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prismaService.category, 'create').mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
      }),
    );

    await expect(
      service.create({ name: 'Saúde' }),
    ).rejects.toThrow(ConflictException);
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
    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prismaService.category, 'update').mockResolvedValue(updated);

    const result = await service.update('cat-1', {
      name: '  Carreira  ',
      position: 2,
    });

    expect(prismaService.category.findFirst).toHaveBeenCalledWith({
      where: {
        name: { equals: 'Carreira', mode: 'insensitive' },
        id: { not: 'cat-1' },
      },
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

  it('deve lancar ConflictException ao tentar atualizar categoria para nome ja em uso por outra', async () => {
    const existing = {
      id: 'cat-1',
      name: 'Trabalho',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const anotherCategory = {
      id: 'cat-2',
      name: 'Estudos',
      description: null,
      position: 1,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(existing);
    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(anotherCategory);

    await expect(
      service.update('cat-1', { name: 'Estudos' }),
    ).rejects.toThrow(new ConflictException('Já existe uma categoria com este nome.'));
  });

  it('deve lancar ConflictException se prisma retornar erro P2002 no update', async () => {
    const existing = {
      id: 'cat-1',
      name: 'Trabalho',
      description: null,
      position: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(prismaService.category, 'findUnique').mockResolvedValue(existing);
    vi.spyOn(prismaService.category, 'findFirst').mockResolvedValue(null);
    vi.spyOn(prismaService.category, 'update').mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.3',
      }),
    );

    await expect(
      service.update('cat-1', { name: 'Finanças' }),
    ).rejects.toThrow(ConflictException);
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
