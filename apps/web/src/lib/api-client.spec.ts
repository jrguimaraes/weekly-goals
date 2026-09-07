import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { apiClient, ApiError, getApiErrorMessage } from './api-client';

describe('apiClient', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('deve realizar GET com sucesso e retornar JSON', async () => {
    const mockData = { status: 'ok', data: [1, 2, 3] };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockData,
    } as Response);

    const result = await apiClient.get<typeof mockData>('/test');

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Accept: 'application/json' }),
      })
    );
  });

  it('deve incluir query params na URL formatada', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({}),
    } as Response);

    await apiClient.get('/items', { params: { active: true, page: 2, skip: undefined } });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/items\?active=true&page=2$/),
      expect.anything()
    );
  });

  it('deve realizar POST enviando corpo JSON', async () => {
    const payload = { name: 'Meta de Estudos' };
    const mockResponse = { id: '1', ...payload };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    } as Response);

    const result = await apiClient.post<typeof mockResponse>('/goals', payload);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/goals'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
        body: JSON.stringify(payload),
      })
    );
  });

  it('deve realizar PATCH enviando corpo JSON', async () => {
    const payload = { currentValue: 5 };
    const mockResponse = { id: '1', ...payload };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => mockResponse,
    } as Response);

    const result = await apiClient.patch<typeof mockResponse>('/goals/1/progress', payload);

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/goals/1/progress'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify(payload),
      })
    );
  });

  it('deve realizar DELETE com sucesso', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => ({ success: true }),
    } as Response);

    const result = await apiClient.delete<{ success: boolean }>('/goals/1');

    expect(result).toEqual({ success: true });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/goals/1'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });

  it('deve tratar resposta 204 No Content', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      headers: new Headers(),
    } as Response);

    const result = await apiClient.delete('/goals/1');

    expect(result).toBeUndefined();
  });

  it('deve lançar ApiError com mensagem do payload de erro da API NestJS', async () => {
    const errorBody = {
      statusCode: 400,
      message: ['title must not be empty', 'targetValue must be positive'],
      error: 'Bad Request',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      headers: new Headers({ 'content-type': 'application/json' }),
      json: async () => errorBody,
    } as Response);

    await expect(apiClient.post('/goals', {})).rejects.toThrow(ApiError);

    try {
      await apiClient.post('/goals', {});
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiError = err as ApiError;
      expect(apiError.statusCode).toBe(400);
      expect(apiError.messages).toEqual([
        'title must not be empty',
        'targetValue must be positive',
      ]);
      expect(apiError.errorName).toBe('Bad Request');
      expect(apiError.message).toBe('title must not be empty, targetValue must be positive');
    }
  });

  it('deve capturar falhas de rede e lançar ApiError com status 0', async () => {
    global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(apiClient.get('/health')).rejects.toThrow(ApiError);

    try {
      await apiClient.get('/health');
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      const apiError = err as ApiError;
      expect(apiError.statusCode).toBe(0);
      expect(apiError.errorName).toBe('NetworkError');
      expect(apiError.message).toContain('Não foi possível conectar ao servidor');
    }
  });

  describe('getApiErrorMessage', () => {
    it('deve extrair mensagens de instância ApiError', () => {
      const err = new ApiError(400, ['Erro 1', 'Erro 2']);
      expect(getApiErrorMessage(err)).toBe('Erro 1, Erro 2');
    });

    it('deve extrair mensagem de Error padrão', () => {
      const err = new Error('Falha genérica');
      expect(getApiErrorMessage(err)).toBe('Falha genérica');
    });

    it('deve retornar string se o erro for uma string', () => {
      expect(getApiErrorMessage('Texto de erro')).toBe('Texto de erro');
    });

    it('deve retornar fallback para valores desconhecidos', () => {
      expect(getApiErrorMessage(null, 'Fallback customizado')).toBe('Fallback customizado');
    });
  });
});
