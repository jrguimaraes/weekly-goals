import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Week } from '@prisma/client';
import { WeekSummaryResponse } from '../metrics/metrics.types.js';
import { CreateWeekDto } from './dto/create-week.dto.js';
import { ListWeeksQueryDto } from './dto/list-weeks-query.dto.js';
import { WeeksService } from './weeks.service.js';

@ApiTags('Weeks')
@Controller('weeks')
export class WeeksController {
  constructor(private readonly weeksService: WeeksService) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra uma nova semana em planejamento (status DRAFT)' })
  @ApiResponse({ status: 201, description: 'Semana criada com sucesso com intervalo de 7 dias calculado' })
  @ApiResponse({ status: 400, description: 'Formato de data inválido ou data inexistente' })
  @ApiResponse({ status: 409, description: 'Período da semana sobrepõe uma semana já cadastrada' })
  async create(@Body() dto: CreateWeekDto): Promise<Week> {
    return this.weeksService.create(dto);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ativa uma semana em planejamento (transição DRAFT -> ACTIVE)' })
  @ApiResponse({ status: 200, description: 'Semana ativada com sucesso' })
  @ApiResponse({ status: 404, description: 'Semana não encontrada' })
  @ApiResponse({ status: 409, description: 'Semana já ativa, fechada ou outra semana já ativa' })
  async activate(@Param('id') id: string): Promise<Week> {
    return this.weeksService.activate(id);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fecha uma semana ativa atomicamente e persiste snapshot do relatório (ACTIVE -> CLOSED)' })
  @ApiResponse({ status: 200, description: 'Semana fechada e relatório gerado com sucesso' })
  @ApiResponse({ status: 404, description: 'Semana não encontrada' })
  @ApiResponse({ status: 409, description: 'Semana já fechada ou status incompatível' })
  async close(@Param('id') id: string): Promise<Week> {
    return this.weeksService.close(id);
  }

  @Get()
  @ApiOperation({ summary: 'Lista semanas cadastradas com ordenação decrescente por data de início' })
  @ApiResponse({ status: 200, description: 'Lista de semanas retornada com sucesso' })
  async findAll(@Query() query: ListWeeksQueryDto): Promise<Week[]> {
    return this.weeksService.findAll(query);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Calcula e retorna o resumo de métricas da semana (geral e por categoria)' })
  @ApiResponse({ status: 200, description: 'Resumo de métricas calculado com sucesso' })
  @ApiResponse({ status: 404, description: 'Semana não encontrada' })
  async getSummary(@Param('id') id: string): Promise<WeekSummaryResponse> {
    return this.weeksService.getSummary(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca dados de uma semana pelo seu identificador UUID' })
  @ApiResponse({ status: 200, description: 'Semana encontrada' })
  @ApiResponse({ status: 404, description: 'Semana não encontrada' })
  async findById(@Param('id') id: string): Promise<Week> {
    return this.weeksService.findById(id);
  }
}

