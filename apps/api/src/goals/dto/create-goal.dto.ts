import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'UUID da categoria à qual a meta pertence',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty({ message: 'categoryId é obrigatório' })
  @IsUUID('4', { message: 'categoryId deve ser um UUID válido' })
  categoryId!: string;

  @ApiProperty({
    description: 'Título descritivo da meta',
    maxLength: 100,
    example: 'Treinar musculação 4 vezes',
  })
  @IsNotEmpty({ message: 'title é obrigatório' })
  @IsString({ message: 'title deve ser uma string' })
  @MaxLength(100, { message: 'title não pode ter mais de 100 caracteres' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Detalhamento ou critérios de sucesso da meta',
    maxLength: 500,
    example: 'Mínimo de 50 minutos por sessão',
  })
  @IsOptional()
  @IsString({ message: 'description deve ser uma string' })
  @MaxLength(500, { message: 'description não pode ter mais de 500 caracteres' })
  description?: string;

  @ApiProperty({
    description: 'Tipo da meta: BINARY (sim/não, targetValue fixado em 1) ou QUANTITY (numérica progressiva)',
    enum: GoalType,
    example: GoalType.BINARY,
  })
  @IsNotEmpty({ message: 'type é obrigatório' })
  @IsEnum(GoalType, { message: 'type deve ser BINARY ou QUANTITY' })
  type!: GoalType;

  @ApiPropertyOptional({
    description: 'Nível de prioridade da meta',
    enum: GoalPriority,
    default: GoalPriority.MEDIUM,
    example: GoalPriority.HIGH,
  })
  @IsOptional()
  @IsEnum(GoalPriority, { message: 'priority deve ser LOW, MEDIUM ou HIGH' })
  priority?: GoalPriority;

  @ApiPropertyOptional({
    description: 'Meta numérica (obrigatória > 0 para QUANTITY; opcional e fixada em 1 para BINARY)',
    example: 1,
  })
  @ValidateIf((o: CreateGoalDto) => o.type === GoalType.QUANTITY || o.targetValue !== undefined)
  @IsNotEmpty({ message: 'targetValue é obrigatório para metas QUANTITY' })
  @IsNumber({}, { message: 'targetValue deve ser um número' })
  @IsPositive({ message: 'targetValue deve ser maior que 0' })
  targetValue?: number;
}

