import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service.js';
import { ReportSnapshot } from './reports.types.js';

@ApiTags('Reports')
@Controller('weeks/:id/report')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtém o snapshot imutável do relatório consolidado de uma semana fechada' })
  @ApiResponse({ status: 200, description: 'Snapshot do relatório retornado com sucesso' })
  @ApiResponse({ status: 400, description: 'Semana ainda não foi fechada (status DRAFT ou ACTIVE)' })
  @ApiResponse({ status: 404, description: 'Semana ou relatório não encontrado' })
  async getReport(@Param('id') id: string): Promise<ReportSnapshot> {
    return this.reportsService.getReport(id);
  }
}

