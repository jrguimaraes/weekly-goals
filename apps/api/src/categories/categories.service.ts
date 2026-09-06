import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data: {
        name: data.name.trim(),
        description: data.description ? data.description.trim() : null,
        position: data.position ?? 0,
      },
    });
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
      updateData.name = data.name.trim();
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

    return this.prisma.category.update({
      where: { id },
      data: updateData,
    });
  }

  async archive(id: string): Promise<Category> {
    await this.findById(id);

    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
