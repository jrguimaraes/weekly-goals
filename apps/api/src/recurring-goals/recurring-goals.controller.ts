import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RecurringGoal } from '@prisma/client';
import { CreateRecurringGoalDto } from './dto/create-recurring-goal.dto.js';
import { UpdateRecurringGoalDto } from './dto/update-recurring-goal.dto.js';
import { RecurringGoalsService } from './recurring-goals.service.js';

@ApiTags('Recurring Goals')
@Controller('recurring-goals')
export class RecurringGoalsController {
  constructor(private readonly recurringGoalsService: RecurringGoalsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todas as metas recorrentes cadastradas' })
  @ApiResponse({ status: 200, description: 'Lista de metas recorrentes' })
  async findAll(): Promise<RecurringGoal[]> {
    return this.recurringGoalsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova meta recorrente' })
  @ApiResponse({ status: 201, description: 'Meta recorrente criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de criação inválidos' })
  @ApiResponse({ status: 404, description: 'Categoria não encontrada' })
  async create(@Body() dto: CreateRecurringGoalDto): Promise<RecurringGoal> {
    return this.recurringGoalsService.create(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma meta recorrente pelo seu identificador UUID' })
  @ApiResponse({ status: 200, description: 'Meta recorrente encontrada' })
  @ApiResponse({ status: 404, description: 'Meta recorrente não encontrada' })
  async findById(@Param('id') id: string): Promise<RecurringGoal> {
    return this.recurringGoalsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita atributos de uma meta recorrente existente' })
  @ApiResponse({ status: 200, description: 'Meta recorrente atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de atualização inválidos' })
  @ApiResponse({ status: 404, description: 'Meta recorrente ou categoria não encontrada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRecurringGoalDto,
  ): Promise<RecurringGoal> {
    return this.recurringGoalsService.update(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Pausa ou reativa uma meta recorrente' })
  @ApiResponse({ status: 200, description: 'Status de ativação alternado com sucesso' })
  @ApiResponse({ status: 404, description: 'Meta recorrente não encontrada' })
  async toggleActive(@Param('id') id: string): Promise<RecurringGoal> {
    return this.recurringGoalsService.toggleActive(id);
  }
}
