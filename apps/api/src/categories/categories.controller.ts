import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Category } from '@prisma/client';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto.js';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }

  @Get()
  async findAll(@Query() query: ListCategoriesQueryDto): Promise<Category[]> {
    return this.categoriesService.findAll(query);
  }
}
