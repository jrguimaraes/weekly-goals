import { Module } from '@nestjs/common';
import { MetricsModule } from '../metrics/metrics.module.js';
import { WeeksController } from './weeks.controller.js';
import { WeeksService } from './weeks.service.js';

@Module({
  imports: [MetricsModule],
  controllers: [WeeksController],
  providers: [WeeksService],
  exports: [WeeksService],
})
export class WeeksModule {}
