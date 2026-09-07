import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Category } from '@prisma/client';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova categoria de metas' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de entrada inválidos' })
  @ApiResponse({ status: 409, description: 'Já existe uma categoria com o nome informado' })
  async create(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista categorias ordenadas por posição e nome' })
  @ApiResponse({ status: 200, description: 'Lista de categorias retornada com sucesso' })
  async findAll(@Query() query: ListCategoriesQueryDto): Promise<Category[]> {
    return this.categoriesService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma categoria pelo seu identificador UUID' })
  @ApiResponse({ status: 200, description: 'Categoria encontrada' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async findById(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza dados de uma categoria existente' })
  @ApiResponse({ status: 200, description: 'Categoria atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos para atualização' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Nome de categoria já em uso' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<Category> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Arquiva (soft delete) uma categoria, marcando-a como inativa' })
  @ApiResponse({ status: 200, description: 'Categoria arquivada com sucesso' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async archive(@Param('id') id: string): Promise<Category> {
    return this.categoriesService.archive(id);
  }
}

