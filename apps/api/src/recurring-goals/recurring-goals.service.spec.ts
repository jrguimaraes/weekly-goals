import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GoalPriority, GoalType } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../prisma/prisma.service.js';
import { RecurringGoalsService } from './recurring-goals.service.js';

describe('RecurringGoalsService', () => {
  let service: RecurringGoalsService;
  let prismaService: PrismaService;

  const mockCategory = {
    id: 'cat-1',
    name: 'Estudos',
    isActive: true,
  };

  const mockRecurringGoal = {
    id: 'rec-1',
    categoryId: 'cat-1',
    title: 'Estudar Anki',
    description: '30 cards diários',
    type: GoalType.QUANTITY,
    priority: GoalPriority.HIGH,
    targetValue: 5,
    active: true,
    createdAt: new Date('2026-09-01'),
    updatedAt: new Date('2026-09-01'),
    category: mockCategory,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecurringGoalsService,
        {
          provide: PrismaService,
          useValue: {
            recurringGoal: {
              findMany: vi.fn(),
              findUnique: vi.fn(),
              create: vi.fn(),
              update: vi.fn(),
            },
            category: {
              findUnique: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<RecurringGoalsService>(RecurringGoalsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('deve listar todas as metas recorrentes ordenadas por createdAt asc', async () => {
      vi.mocked(prismaService.recurringGoal.findMany).mockResolvedValue([mockRecurringGoal] as any);

      const result = await service.findAll();

      expect(prismaService.recurringGoal.findMany).toHaveBeenCalledWith({
        include: { category: true },
        orderBy: { createdAt: 'asc' },
      });
      expect(result).toEqual([mockRecurringGoal]);
    });
  });

  describe('findById', () => {
    it('deve retornar a meta recorrente encontrada', async () => {
      vi.mocked(prismaService.recurringGoal.findUnique).mockResolvedValue(mockRecurringGoal as any);

      const result = await service.findById('rec-1');

      expect(prismaService.recurringGoal.findUnique).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
        include: { category: true },
      });
      expect(result).toEqual(mockRecurringGoal);
    });

    it('deve lançar NotFoundException quando a meta recorrente não existir', async () => {
      vi.mocked(prismaService.recurringGoal.findUnique).mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('deve criar uma meta recorrente do tipo QUANTITY com sucesso', async () => {
      vi.mocked(prismaService.category.findUnique).mockResolvedValue(mockCategory as any);
      vi.mocked(prismaService.recurringGoal.findMany).mockResolvedValue([]);
      vi.mocked(prismaService.recurringGoal.create).mockResolvedValue(mockRecurringGoal as any);

      const result = await service.create({
        categoryId: 'cat-1',
        title: 'Estudar Anki',
        description: '30 cards diários',
        type: GoalType.QUANTITY,
        priority: GoalPriority.HIGH,
        targetValue: 5,
        active: true,
      });

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
      expect(prismaService.recurringGoal.create).toHaveBeenCalledWith({
        data: {
          categoryId: 'cat-1',
          title: 'Estudar Anki',
          description: '30 cards diários',
          type: GoalType.QUANTITY,
          priority: GoalPriority.HIGH,
          targetValue: 5,
          active: true,
        },
        include: { category: true },
      });
      expect(result).toEqual(mockRecurringGoal);
    });

    it('deve criar uma meta recorrente do tipo BINARY com targetValue fixado em 1', async () => {
      vi.mocked(prismaService.category.findUnique).mockResolvedValue(mockCategory as any);
      vi.mocked(prismaService.recurringGoal.findMany).mockResolvedValue([]);
      const binaryGoal = { ...mockRecurringGoal, type: GoalType.BINARY, targetValue: 1 };
      vi.mocked(prismaService.recurringGoal.create).mockResolvedValue(binaryGoal as any);

      const result = await service.create({
        categoryId: 'cat-1',
        title: 'Leitura diária',
        type: GoalType.BINARY,
      });

      expect(prismaService.recurringGoal.create).toHaveBeenCalledWith({
        data: {
          categoryId: 'cat-1',
          title: 'Leitura diária',
          description: null,
          type: GoalType.BINARY,
          priority: GoalPriority.MEDIUM,
          targetValue: 1,
          active: true,
        },
        include: { category: true },
      });
      expect(result).toEqual(binaryGoal);
    });

    it('deve atualizar meta recorrente se já existir com o mesmo título normalizado e categoria', async () => {
      vi.mocked(prismaService.category.findUnique).mockResolvedValue(mockCategory as any);
      vi.mocked(prismaService.recurringGoal.findMany).mockResolvedValue([
        { ...mockRecurringGoal, id: 'rec-existing', active: false },
      ] as any);
      vi.mocked(prismaService.recurringGoal.update).mockResolvedValue(mockRecurringGoal as any);

      const result = await service.create({
        categoryId: 'cat-1',
        title: '  estudar anki  ',
        type: GoalType.QUANTITY,
        targetValue: 5,
      });

      expect(prismaService.recurringGoal.update).toHaveBeenCalledWith({
        where: { id: 'rec-existing' },
        data: {
          title: 'estudar anki',
          description: null,
          type: GoalType.QUANTITY,
          priority: GoalPriority.MEDIUM,
          targetValue: 5,
          active: true,
        },
        include: { category: true },
      });
      expect(result).toEqual(mockRecurringGoal);
    });

    it('deve lançar NotFoundException se a categoria não existir', async () => {
      vi.mocked(prismaService.category.findUnique).mockResolvedValue(null);

      await expect(
        service.create({
          categoryId: 'non-existent',
          title: 'Goal',
          type: GoalType.BINARY,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se a categoria estiver inativa', async () => {
      vi.mocked(prismaService.category.findUnique).mockResolvedValue({
        ...mockCategory,
        isActive: false,
      } as any);

      await expect(
        service.create({
          categoryId: 'cat-1',
          title: 'Goal',
          type: GoalType.BINARY,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se tipo for BINARY e targetValue for diferente de 1', async () => {
      vi.mocked(prismaService.category.findUnique).mockResolvedValue(mockCategory as any);

      await expect(
        service.create({
          categoryId: 'cat-1',
          title: 'Goal',
          type: GoalType.BINARY,
          targetValue: 3,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se tipo for QUANTITY e targetValue for menor ou igual a zero', async () => {
      vi.mocked(prismaService.category.findUnique).mockResolvedValue(mockCategory as any);

      await expect(
        service.create({
          categoryId: 'cat-1',
          title: 'Goal',
          type: GoalType.QUANTITY,
          targetValue: 0,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('update', () => {
    it('deve atualizar atributos da meta recorrente com sucesso', async () => {
      vi.mocked(prismaService.recurringGoal.findUnique).mockResolvedValue(mockRecurringGoal as any);
      const updated = { ...mockRecurringGoal, targetValue: 10, title: 'Anki Pro' };
      vi.mocked(prismaService.recurringGoal.update).mockResolvedValue(updated as any);

      const result = await service.update('rec-1', {
        title: 'Anki Pro',
        targetValue: 10,
      });

      expect(prismaService.recurringGoal.update).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
        data: {
          categoryId: undefined,
          title: 'Anki Pro',
          description: undefined,
          priority: undefined,
          targetValue: 10,
          active: undefined,
        },
        include: { category: true },
      });
      expect(result).toEqual(updated);
    });

    it('deve validar categoria ao alterar categoryId', async () => {
      vi.mocked(prismaService.recurringGoal.findUnique).mockResolvedValue(mockRecurringGoal as any);
      vi.mocked(prismaService.category.findUnique).mockResolvedValue({
        id: 'cat-2',
        name: 'Saúde',
        isActive: false,
      } as any);

      await expect(
        service.update('rec-1', {
          categoryId: 'cat-2',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se alterar targetValue de QUANTITY para <= 0', async () => {
      vi.mocked(prismaService.recurringGoal.findUnique).mockResolvedValue(mockRecurringGoal as any);

      await expect(
        service.update('rec-1', {
          targetValue: -1,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('toggleActive', () => {
    it('deve alternar active de true para false', async () => {
      vi.mocked(prismaService.recurringGoal.findUnique).mockResolvedValue({
        ...mockRecurringGoal,
        active: true,
      } as any);
      vi.mocked(prismaService.recurringGoal.update).mockResolvedValue({
        ...mockRecurringGoal,
        active: false,
      } as any);

      const result = await service.toggleActive('rec-1');

      expect(prismaService.recurringGoal.update).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
        data: { active: false },
        include: { category: true },
      });
      expect(result.active).toBe(false);
    });

    it('deve alternar active de false para true', async () => {
      vi.mocked(prismaService.recurringGoal.findUnique).mockResolvedValue({
        ...mockRecurringGoal,
        active: false,
      } as any);
      vi.mocked(prismaService.recurringGoal.update).mockResolvedValue({
        ...mockRecurringGoal,
        active: true,
      } as any);

      const result = await service.toggleActive('rec-1');

      expect(prismaService.recurringGoal.update).toHaveBeenCalledWith({
        where: { id: 'rec-1' },
        data: { active: true },
        include: { category: true },
      });
      expect(result.active).toBe(true);
    });
  });
});
