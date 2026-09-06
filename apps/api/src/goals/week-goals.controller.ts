import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Goal } from '@prisma/client';
import { CreateGoalDto } from './dto/create-goal.dto.js';
import { ListGoalsQueryDto } from './dto/list-goals-query.dto.js';
import { GoalsService } from './goals.service.js';

@Controller('weeks/:weekId/goals')
export class WeekGoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  async create(
    @Param('weekId') weekId: string,
    @Body() dto: CreateGoalDto,
  ): Promise<Goal> {
    return this.goalsService.create(weekId, dto);
  }

  @Get()
  async findByWeekId(
    @Param('weekId') weekId: string,
    @Query() query?: ListGoalsQueryDto,
  ): Promise<Goal[]> {
    return this.goalsService.findByWeekId(weekId, query);
  }
}
