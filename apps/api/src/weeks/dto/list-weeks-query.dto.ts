import { IsEnum, IsOptional } from 'class-validator';
import { WeekStatus } from '@prisma/client';

export class ListWeeksQueryDto {
  @IsOptional()
  @IsEnum(WeekStatus, {
    message: 'status deve ser DRAFT, ACTIVE ou CLOSED.',
  })
  status?: WeekStatus;
}
