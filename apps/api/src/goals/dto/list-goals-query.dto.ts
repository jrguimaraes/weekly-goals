import { ApiPropertyOptional } from '@nestjs/swagger';
import { GoalStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ListGoalsQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar metas por ID de categoria',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar metas por status',
    enum: GoalStatus,
    example: GoalStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(GoalStatus, {
    message: 'status deve ser PENDING, IN_PROGRESS ou COMPLETED',
  })
  status?: GoalStatus;
}

