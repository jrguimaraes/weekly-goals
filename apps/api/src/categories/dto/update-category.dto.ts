import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Novo nome da categoria',
    example: 'Saúde e Bem-estar',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Nova descrição da categoria',
    example: 'Cuidados com saúde física e mental',
  })
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Nova posição ordinal',
    example: 2,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @ApiPropertyOptional({
    description: 'Status ativo/inativo da categoria',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

