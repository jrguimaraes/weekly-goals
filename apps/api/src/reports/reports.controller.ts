import { Controller, Get, Param } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { ReportSnapshot } from './reports.types.js';

@Controller('weeks/:id/report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getReport(@Param('id') id: string): Promise<ReportSnapshot> {
    return this.reportsService.getReport(id);
  }
}
