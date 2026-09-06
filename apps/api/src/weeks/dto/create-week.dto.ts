import { IsNotEmpty, Matches } from 'class-validator';

export class CreateWeekDto {
  @IsNotEmpty({ message: 'startDate é obrigatório' })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'startDate deve estar no formato AAAA-MM-DD (ex: 2026-09-07)',
  })
  startDate!: string;
}
