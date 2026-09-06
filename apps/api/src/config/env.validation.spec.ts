import { describe, expect, it } from 'vitest';
import { Environment, validateEnv } from './env.validation.js';

describe('validateEnv', () => {
  it('deve validar com sucesso variáveis corretas', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '3333',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/db',
    };

    const result = validateEnv(config);

    expect(result.NODE_ENV).toBe(Environment.Development);
    expect(result.PORT).toBe(3333);
    expect(result.DATABASE_URL).toBe('postgresql://postgres:postgres@localhost:5432/db');
  });

  it('deve usar valores padrão para NODE_ENV e PORT quando ausentes', () => {
    const config = {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/db',
    };

    const result = validateEnv(config);

    expect(result.NODE_ENV).toBe(Environment.Development);
    expect(result.PORT).toBe(3000);
  });

  it('deve lançar erro quando DATABASE_URL estiver ausente', () => {
    const config = {
      NODE_ENV: 'development',
      PORT: '3000',
    };

    expect(() => validateEnv(config)).toThrow(
      /Falha na validação das variáveis de ambiente/,
    );
  });

  it('deve lançar erro quando NODE_ENV for inválido', () => {
    const config = {
      NODE_ENV: 'invalid_env',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/db',
    };

    expect(() => validateEnv(config)).toThrow(
      /Falha na validação das variáveis de ambiente/,
    );
  });
});
