import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Goal } from '@prisma/client';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalsService } from './goals.service.js';

@ApiTags('Goals')
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Busca uma meta pelo seu identificador UUID' })
  @ApiResponse({ status: 200, description: 'Meta encontrada' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  async findById(@Param('id') id: string): Promise<Goal> {
    return this.goalsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita atributos de uma meta existente (o tipo Goal.type é imutável após a criação; bloqueado se a semana estiver fechada)' })
  @ApiResponse({ status: 200, description: 'Meta atualizada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados de atualização inválidos' })
  @ApiResponse({ status: 404, description: 'Meta ou categoria não encontrada' })
  @ApiResponse({ status: 409, description: 'A semana da meta já está fechada' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.update(id, dto);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Atualiza o progresso numérico de uma meta com recálculo automático de status' })
  @ApiResponse({ status: 200, description: 'Progresso atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Valor de progresso inválido' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  @ApiResponse({ status: 409, description: 'A semana da meta já está fechada' })
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateGoalProgressDto,
  ): Promise<Goal> {
    return this.goalsService.updateProgress(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma meta existente (bloqueado se a semana estiver fechada)' })
  @ApiResponse({ status: 200, description: 'Meta removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  @ApiResponse({ status: 409, description: 'A semana da meta já está fechada' })
  async delete(@Param('id') id: string): Promise<Goal> {
    return this.goalsService.delete(id);
  }
}

