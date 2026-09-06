import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
