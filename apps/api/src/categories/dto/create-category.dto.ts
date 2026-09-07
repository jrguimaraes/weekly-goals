import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome único da categoria',
    example: 'Saúde',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({
    description: 'Descrição opcional dos objetivos da categoria',
    example: 'Atividades físicas, alimentação e descanso',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Posição ordinal para ordenação na listagem',
    example: 1,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}

