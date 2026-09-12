import { describe, it, expect } from 'vitest';
import {
  calculateEndDate,
  formatDate,
  formatDateRange,
  formatRelativeUpdatedAt,
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

  describe('formatRelativeUpdatedAt', () => {
    const baseDate = new Date(2026, 8, 11, 15, 30, 0); // 11 de setembro de 2026
    const createdDate = new Date(2026, 8, 1, 10, 0, 0).toISOString(); // criado no dia 01/09

    it('deve retornar "sem atualizações" quando updatedAt for idêntico a createdAt', () => {
      const sameTimestamp = new Date(2026, 8, 5, 10, 0, 0).toISOString();
      expect(formatRelativeUpdatedAt(sameTimestamp, sameTimestamp, baseDate)).toBe('sem atualizações');
    });

    it('deve retornar "sem atualizações" quando a diferença entre updatedAt e createdAt for de até 1 segundo', () => {
      const created = new Date(2026, 8, 5, 10, 0, 0, 0).toISOString();
      const updated = new Date(2026, 8, 5, 10, 0, 0, 500).toISOString();
      expect(formatRelativeUpdatedAt(updated, created, baseDate)).toBe('sem atualizações');
    });

    it('deve formatar como "atualizado hoje" quando for na mesma data e diferente de createdAt', () => {
      const today = new Date(2026, 8, 11, 8, 0, 0).toISOString();
      expect(formatRelativeUpdatedAt(today, createdDate, baseDate)).toBe('atualizado hoje');
    });

    it('deve formatar como "atualizado ontem" quando for no dia anterior e diferente de createdAt', () => {
      const yesterday = new Date(2026, 8, 10, 20, 0, 0).toISOString();
      expect(formatRelativeUpdatedAt(yesterday, createdDate, baseDate)).toBe('atualizado ontem');
    });

    it('deve formatar como "atualizado há 2 dias" quando for 2 dias antes e diferente de createdAt', () => {
      const twoDaysAgo = new Date(2026, 8, 9, 10, 0, 0).toISOString();
      expect(formatRelativeUpdatedAt(twoDaysAgo, createdDate, baseDate)).toBe('atualizado há 2 dias');
    });

    it('deve formatar como "atualizado há X dias" para intervalos maiores', () => {
      const fiveDaysAgo = new Date(2026, 8, 6, 12, 0, 0).toISOString();
      expect(formatRelativeUpdatedAt(fiveDaysAgo, createdDate, baseDate)).toBe('atualizado há 5 dias');
    });

    it('deve retornar string vazia para datas vazias ou inválidas', () => {
      expect(formatRelativeUpdatedAt('', createdDate, baseDate)).toBe('');
      expect(formatRelativeUpdatedAt('data-invalida', createdDate, baseDate)).toBe('');
    });
  });
});
