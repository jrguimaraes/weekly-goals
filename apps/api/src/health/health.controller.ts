import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckResult, HealthService } from './health.service.js';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Verifica o status de saúde da aplicação e do banco de dados' })
  @ApiResponse({ status: 200, description: 'Aplicação e banco de dados operacionais' })
  @ApiResponse({ status: 503, description: 'Serviço indisponível ou falha na conexão com banco de dados' })
  async check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}

