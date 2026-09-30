import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class ImportGoalsDto {
  @ApiProperty({
    description: 'Lista de IDs das metas da semana anterior a serem importadas',
    example: ['d9b9a67a-1234-4567-890a-bcdef1234567'],
  })
  @IsArray({ message: 'goalIds deve ser uma lista de identificadores' })
  @ArrayNotEmpty({ message: 'Selecione pelo menos uma meta para importar' })
  @IsString({ each: true, message: 'Cada ID de meta deve ser uma string' })
  goalIds!: string[];
}
