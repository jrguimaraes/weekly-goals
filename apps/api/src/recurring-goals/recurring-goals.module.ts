import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { RecurringGoalsController } from './recurring-goals.controller.js';
import { RecurringGoalsService } from './recurring-goals.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [RecurringGoalsController],
  providers: [RecurringGoalsService],
  exports: [RecurringGoalsService],
})
export class RecurringGoalsModule {}
