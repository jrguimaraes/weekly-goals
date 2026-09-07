import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateGoalProgressDto {
  @IsNotEmpty({ message: 'currentValue é obrigatório' })
  @IsNumber({}, { message: 'currentValue deve ser um número' })
  @Min(0, { message: 'currentValue deve ser maior ou igual a 0' })
  currentValue!: number;
}
