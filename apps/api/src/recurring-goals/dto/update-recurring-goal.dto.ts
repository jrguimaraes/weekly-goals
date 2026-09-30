import { ApiPropertyOptional } from '@nestjs/swagger';
import { GoalPriority } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateRecurringGoalDto {
  @ApiPropertyOptional({
    description: 'UUID da categoria à qual a meta recorrente pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Título descritivo da meta recorrente',
    maxLength: 100,
    example: 'Estudar inglês no Anki',
  })
  @IsOptional()
  @IsString({ message: 'title deve ser uma string' })
  @MaxLength(100, { message: 'title não pode ter mais de 100 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Detalhamento ou critérios de sucesso da meta',
    maxLength: 500,
    example: 'Completar revisões diárias',
  })
  @IsOptional()
  @IsString({ message: 'description deve ser uma string' })
  @MaxLength(500, { message: 'description não pode ter mais de 500 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Nível de prioridade da meta',
    enum: GoalPriority,
    example: GoalPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(GoalPriority, { message: 'priority deve ser LOW, MEDIUM ou HIGH' })
  priority?: GoalPriority;

  @ApiPropertyOptional({
    description: 'Meta numérica (deve ser > 0 se fornecida)',
    example: 5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'targetValue deve ser um número' })
  @IsPositive({ message: 'targetValue deve ser maior que 0' })
  targetValue?: number;

  @ApiPropertyOptional({
    description: 'Status de ativação da recorrência',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'active deve ser um booleano' })
  active?: boolean;
}
