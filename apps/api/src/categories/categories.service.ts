import { Injectable } from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCategoryDto): Promise<Category> {
    return this.prisma.category.create({
      data: {
        name: data.name,
        description: data.description,
        position: data.position ?? 0,
      },
    });
  }

  async findAll(): Promise<Category[]> {
    return this.prisma.category.findMany({
      orderBy: { position: 'asc' },
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.prisma.category.findUnique({
      where: { id },
    });
  }
}
