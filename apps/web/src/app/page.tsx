'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, getApiErrorMessage } from '../lib/api-client';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import type { HealthCheckResponse } from '../types/api';

export default function HomePage() {
  const [health, setHealth] = useState<HealthCheckResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkApiHealth = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.get<HealthCheckResponse>('/health');
      setHealth(data);
    } catch (err) {
      setHealth(null);
      setError(
        getApiErrorMessage(
          err,
          'Não foi possível se comunicar com a API. Certifique-se de que o backend está ativo.'
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialCheck() {
      try {
        const data = await apiClient.get<HealthCheckResponse>('/health');
        if (isMounted) {
          setHealth(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setHealth(null);
          setError(
            getApiErrorMessage(
              err,
              'Não foi possível se comunicar com a API. Certifique-se de que o backend está ativo.'
            )
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialCheck();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Painel Operacional
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Planejamento semanal estruturado, registro contínuo de metas e acompanhamento determinístico.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Conexão com a API Backend
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Status operacional do endpoint de saúde e persistência de dados.
            </p>
          </div>
          <button
            type="button"
            onClick={checkApiHealth}
            disabled={isLoading}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Verificando...' : 'Reverificar conexão'}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100">
          {isLoading && (
            <div className="py-4">
              <LoadingSpinner label="Consultando saúde do servidor..." size="md" />
            </div>
          )}

          {!isLoading && error && (
            <div className="space-y-3">
              <Alert
                title="API Indisponível"
                message={error}
                variant="error"
              />
              <p className="text-xs text-slate-500">
                Dica: Inicie o servidor da API com <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">pnpm start:api</code> e o banco com <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">pnpm db:up</code>.
              </p>
            </div>
          )}

          {!isLoading && health && (
            <div className="flex flex-wrap items-center gap-6 rounded-lg bg-emerald-50/60 p-4 border border-emerald-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Serviço:</span>
                <Badge variant="success">Online</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-600">Banco de Dados:</span>
                <Badge variant={health.database === 'connected' ? 'success' : 'warning'}>
                  {health.database === 'connected' ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <div className="text-xs text-slate-500">
                Última checagem: {new Date(health.timestamp).toLocaleTimeString('pt-BR')}
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/categories"
          className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Categorias
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Gerenciamento de categorias ativas, ordenação e arquivamento de áreas de foco.
          </p>
        </Link>

        <Link
          href="/weeks"
          className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Planejamento Semanal
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Criação de novos ciclos, ativação da semana e definição de metas semanais.
          </p>
        </Link>

        <Link
          href="/history"
          className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all sm:col-span-2 lg:col-span-1"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Histórico & Relatórios
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Consulta imutável de relatórios consolidados e taxas de conclusão passadas.
          </p>
        </Link>
      </section>
    </div>
  );
}
