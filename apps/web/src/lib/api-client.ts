import { API_BASE_URL } from './config';
import type { ApiErrorResponse, RequestOptions } from '../types/api';

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly messages: string[];
  public readonly errorName?: string;

  constructor(statusCode: number, messages: string | string[], errorName?: string) {
    const messageList = Array.isArray(messages) ? messages : [messages];
    super(messageList.join(', '));
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.messages = messageList;
    this.errorName = errorName;

    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
): string {
  if (error instanceof ApiError) {
    return error.messages.join(', ');
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return fallback;
}

function buildUrl(
  path: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = API_BASE_URL.replace(/\/+$/, '');
  const url = new URL(`${baseUrl}${normalizedPath}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as unknown as T;
  }

  const contentType = response.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  let data: unknown;
  try {
    data = isJson ? await response.json() : await response.text();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (data && typeof data === 'object') {
      const errorPayload = data as Partial<ApiErrorResponse>;
      const statusCode = errorPayload.statusCode || response.status;
      const message = errorPayload.message || response.statusText || 'Erro na requisição';
      const errorName = errorPayload.error;
      throw new ApiError(statusCode, message, errorName);
    }

    throw new ApiError(
      response.status,
      typeof data === 'string' && data ? data : response.statusText || 'Erro na requisição'
    );
  }

  return data as T;
}

export const apiClient = {
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(path, params);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(fetchOptions.headers || {}),
        },
        ...fetchOptions,
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        'Não foi possível conectar ao servidor. Verifique se a API está em execução.',
        'NetworkError'
      );
    }
  },

  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(path, params);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(fetchOptions.headers || {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...fetchOptions,
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        'Não foi possível conectar ao servidor. Verifique se a API está em execução.',
        'NetworkError'
      );
    }
  },

  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(path, params);

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(fetchOptions.headers || {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        ...fetchOptions,
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        'Não foi possível conectar ao servidor. Verifique se a API está em execução.',
        'NetworkError'
      );
    }
  },

  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = buildUrl(path, params);

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
          ...(fetchOptions.headers || {}),
        },
        ...fetchOptions,
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        'Não foi possível conectar ao servidor. Verifique se a API está em execução.',
        'NetworkError'
      );
    }
  },
};
