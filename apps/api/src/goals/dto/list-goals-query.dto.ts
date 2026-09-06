import { GoalStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class ListGoalsQueryDto {
  @IsOptional()
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId?: string;

  @IsOptional()
  @IsEnum(GoalStatus, {
    message: 'status deve ser PENDING, IN_PROGRESS ou COMPLETED',
  })
  status?: GoalStatus;
}
