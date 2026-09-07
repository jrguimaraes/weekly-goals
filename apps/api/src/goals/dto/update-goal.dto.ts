import { ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiPropertyOptional({
    description: 'Novo UUID de categoria para a meta',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsNotEmpty({ message: 'categoryId não pode ser vazio' })
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Novo título da meta',
    maxLength: 100,
    example: 'Treinar musculação 5 vezes',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsNotEmpty({ message: 'title não pode ser vazio' })
  @IsString({ message: 'title deve ser uma string' })
  @MaxLength(100, { message: 'title não pode ter mais de 100 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Nova descrição da meta',
    maxLength: 500,
    example: 'Aumentar intensidade',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsOptional()
  @IsString({ message: 'description deve ser uma string' })
  @MaxLength(500, { message: 'description não pode ter mais de 500 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Novo tipo da meta',
    enum: GoalType,
    example: GoalType.QUANTITY,
  })
  @IsOptional()
  @IsEnum(GoalType, { message: 'type deve ser BINARY ou QUANTITY' })
  type?: GoalType;

  @ApiPropertyOptional({
    description: 'Nova prioridade da meta',
    enum: GoalPriority,
    example: GoalPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(GoalPriority, { message: 'priority deve ser LOW, MEDIUM ou HIGH' })
  priority?: GoalPriority;

  @ApiPropertyOptional({
    description: 'Novo valor alvo (> 0 para QUANTITY, 1 para BINARY)',
    example: 5,
  })
  @IsOptional()
  @IsNumber({}, { message: 'targetValue deve ser um número' })
  @IsPositive({ message: 'targetValue deve ser maior que 0' })
  targetValue?: number;
}

