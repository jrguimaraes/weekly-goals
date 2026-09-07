import { ApiPropertyOptional } from '@nestjs/swagger';
import { WeekStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListWeeksQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar semanas pelo status do ciclo de vida',
    enum: WeekStatus,
    example: WeekStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(WeekStatus, {
    message: 'status deve ser DRAFT, ACTIVE ou CLOSED.',
  })
  status?: WeekStatus;
}

