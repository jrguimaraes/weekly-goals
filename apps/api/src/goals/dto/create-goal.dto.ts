import { GoalPriority, GoalType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateGoalDto {
  @IsNotEmpty({ message: 'categoryId é obrigatório' })
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId!: string;

  @IsNotEmpty({ message: 'title é obrigatório' })
  @IsString({ message: 'title deve ser uma string' })
  @MaxLength(100, { message: 'title não pode ter mais de 100 caracteres' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'description deve ser uma string' })
  @MaxLength(500, { message: 'description não pode ter mais de 500 caracteres' })
  description?: string;

  @IsNotEmpty({ message: 'type é obrigatório' })
  @IsEnum(GoalType, { message: 'type deve ser BINARY ou QUANTITY' })
  type!: GoalType;

  @IsOptional()
  @IsEnum(GoalPriority, { message: 'priority deve ser LOW, MEDIUM ou HIGH' })
  priority?: GoalPriority;

  @ValidateIf((o: CreateGoalDto) => o.type === GoalType.QUANTITY || o.targetValue !== undefined)
  @IsNotEmpty({ message: 'targetValue é obrigatório para metas QUANTITY' })
  @IsNumber({}, { message: 'targetValue deve ser um número' })
  @IsPositive({ message: 'targetValue deve ser maior que 0' })
  targetValue?: number;
}
