export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

export interface HealthDatabaseStatus {
  status: 'up' | 'down';
  message?: string;
}

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  database: HealthDatabaseStatus;
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  params?: Record<string, string | number | boolean | undefined | null>;
}
