import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Goal } from '@prisma/client';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { ListGoalsQueryDto } from './dto/list-goals-query.dto.js';
import { GoalsService } from './goals.service.js';

@ApiTags('Goals')
@Controller('weeks/:weekId/goals')
export class WeekGoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova meta vinculada a uma semana (bloqueado se a semana estiver fechada)' })
  @ApiResponse({ status: 201, description: 'Meta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de meta inválidos ou categoria inativa' })
  @ApiResponse({ status: 404, description: 'Semana ou categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'Não é possível adicionar metas a uma semana fechada' })
  async create(
    @Param('weekId') weekId: string,
    @Body() dto: CreateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.create(weekId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista metas de uma semana específica com filtros opcionais por categoria ou status' })
  @ApiResponse({ status: 200, description: 'Lista de metas retornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Semana não encontrada' })
  async findByWeekId(
    @Param('weekId') weekId: string,
    @Query() query?: ListGoalsQueryDto,
  ): Promise<Goal[]> {
    return this.goalsService.findByWeekId(weekId, query);
  }
}

