import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListCategoriesQueryDto {
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
