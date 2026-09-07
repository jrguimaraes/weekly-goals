import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
} from '@nestjs/common';
import { Goal } from '@prisma/client';
import { UpdateGoalProgressDto } from './dto/update-goal-progress.dto.js';
import { UpdateGoalDto } from './dto/update-goal.dto.js';
import { GoalsService } from './goals.service.js';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Goal> {
    return this.goalsService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.update(id, dto);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateGoalProgressDto,
  ): Promise<Goal> {
    return this.goalsService.updateProgress(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Goal> {
    return this.goalsService.delete(id);
  }
}
