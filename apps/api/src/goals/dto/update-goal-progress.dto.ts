import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateGoalProgressDto {
  @ApiProperty({
    description: 'Novo valor do progresso (0 ou 1 para BINARY; >= 0 para QUANTITY)',
    example: 1,
  })
  @IsNotEmpty({ message: 'currentValue é obrigatório' })
  @IsNumber({}, { message: 'currentValue deve ser um número' })
  @Min(0, { message: 'currentValue deve ser maior ou igual a 0' })
  currentValue!: number;
}

