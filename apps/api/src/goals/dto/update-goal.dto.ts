import { GoalPriority, GoalType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateGoalDto {
  @IsOptional()
  @IsNotEmpty({ message: 'categoryId não pode ser vazio' })
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @IsString({ message: 'title deve ser uma string' })
  @MaxLength(100, { message: 'title não pode ter mais de 100 caracteres' })
  title?: string;

  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString({ message: 'description deve ser uma string' })
  @MaxLength(500, { message: 'description não pode ter mais de 500 caracteres' })
  description?: string;

  @IsOptional()
  @IsEnum(GoalType, { message: 'type deve ser BINARY ou QUANTITY' })
  type?: GoalType;

  @IsOptional()
  @IsEnum(GoalPriority, { message: 'priority deve ser LOW, MEDIUM ou HIGH' })
  priority?: GoalPriority;

  @IsOptional()
  @IsNumber({}, { message: 'targetValue deve ser um número' })
  @IsPositive({ message: 'targetValue deve ser maior que 0' })
  targetValue?: number;
}
