import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Category, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    const trimmedName = data.name.trim();

    const existing = await this.prisma.category.findFirst({
      where: {
        name: { equals: trimmedName, mode: 'insensitive' },
      },
    });

    if (existing) {
      throw new ConflictException('Já existe uma categoria com este nome.');
    }

    try {
      return await this.prisma.category.create({
        data: {
          name: trimmedName,
          description: data.description ? data.description.trim() : null,
          position: data.position ?? 0,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma categoria com este nome.');
      }
      throw error;
    }
  }

  async findAll(query?: ListCategoriesQueryDto): Promise<Category[]> {
    const where =
      query?.isActive !== undefined ? { isActive: query.isActive } : {};

    return this.prisma.category.findMany({
      where,
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Categoria com id "${id}" não encontrada.`);
    }

    return category;
  }

  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    await this.findById(id);

    const updateData: {
      name?: string;
      description?: string | null;
      position?: number;
      isActive?: boolean;
    } = {};

    if (data.name !== undefined) {
      const trimmedName = data.name.trim();

      const existing = await this.prisma.category.findFirst({
        where: {
          name: { equals: trimmedName, mode: 'insensitive' },
          id: { not: id },
        },
      });

      if (existing) {
        throw new ConflictException('Já existe uma categoria com este nome.');
      }

      updateData.name = trimmedName;
    }
    if (data.description !== undefined) {
      updateData.description = data.description ? data.description.trim() : null;
    }
    if (data.position !== undefined) {
      updateData.position = data.position;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    try {
      return await this.prisma.category.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Já existe uma categoria com este nome.');
      }
      throw error;
    }
  }

  async archive(id: string): Promise<Category> {
    await this.findById(id);

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

