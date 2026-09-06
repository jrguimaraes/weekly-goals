import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto.js';

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

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }
}
