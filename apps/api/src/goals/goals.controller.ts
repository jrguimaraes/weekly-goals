import { Controller, Get, Param } from '@nestjs/common';
import { Goal } from '@prisma/client';
import { GoalsService } from './goals.service.js';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Goal> {
    return this.goalsService.findById(id);
  }
}
