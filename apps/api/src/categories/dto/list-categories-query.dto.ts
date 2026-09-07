import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListCategoriesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar categorias por status ativo/inativo',
    example: true,
  })
  @IsOptional()
  @Transform(({ obj }: { obj: Record<string, unknown> }) => {
    const val = obj?.isActive;
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return val;
  })
  @IsBoolean()
  isActive?: boolean;
}

