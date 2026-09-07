import { describe, it, expect } from 'vitest';
import {
  calculateEndDate,
  formatDate,
  formatDateRange,
  getSuggestedStartDate,
  parseIsoDateOnly,
} from './date-utils';

describe('date-utils', () => {
  it('deve extrair ano, mês e dia de string ISO', () => {
    const result = parseIsoDateOnly('2026-09-07T00:00:00.000Z');
    expect(result).toEqual({ year: 2026, month: 9, day: 7 });
  });

  it('deve formatar data para DD/MM/AAAA', () => {
    expect(formatDate('2026-09-07')).toBe('07/09/2026');
    expect(formatDate('2026-09-13T00:00:00.000Z')).toBe('13/09/2026');
  });

  it('deve formatar intervalo de datas', () => {
    expect(formatDateRange('2026-09-07', '2026-09-13')).toBe('07/09/2026 a 13/09/2026');
  });

  it('deve calcular endDate exatamente 6 dias após startDate (ciclo de 7 dias)', () => {
    expect(calculateEndDate('2026-09-07')).toBe('2026-09-13');
    expect(calculateEndDate('2026-02-25')).toBe('2026-03-03');
    expect(calculateEndDate('2026-12-28')).toBe('2027-01-03');
  });

  it('deve retornar string vazia para startDate em formato inválido', () => {
    expect(calculateEndDate('invalido')).toBe('');
  });

  it('deve sugerir a próxima segunda-feira a partir de uma data fornecida', () => {
    // 2026-09-09 é uma quarta-feira (day 3) -> próxima segunda é 2026-09-14
    const wednesday = new Date(2026, 8, 9);
    expect(getSuggestedStartDate(wednesday)).toBe('2026-09-14');

    // 2026-09-07 é uma segunda-feira (day 1) -> mantém 2026-09-07
    const monday = new Date(2026, 8, 7);
    expect(getSuggestedStartDate(monday)).toBe('2026-09-07');
  });
});
