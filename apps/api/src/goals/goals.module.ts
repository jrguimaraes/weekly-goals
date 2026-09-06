import { Module } from '@nestjs/common';
import { GoalsController } from './goals.controller.js';
import { GoalsService } from './goals.service.js';
import { WeekGoalsController } from './week-goals.controller.js';

@Module({
  controllers: [GoalsController, WeekGoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
