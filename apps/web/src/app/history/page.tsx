'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { weeksService } from '../../services/weeks.service';
import { HistoryWeekCard } from '../../components/history/HistoryWeekCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Alert } from '../../components/ui/Alert';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Week, WeekStatus } from '../../types/week';

type HistoryFilter = 'ALL' | 'CLOSED' | 'ACTIVE' | 'DRAFT';

export default function HistoryPage() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>('ALL');

  const loadWeeks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await weeksService.list();
      const sorted = [...data].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      setWeeks(sorted);
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Falha ao carregar o histórico de ciclos semanais.')
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const data = await weeksService.list();
        if (!isMounted) return;
        const sorted = [...data].sort(
          (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setWeeks(sorted);
        setError(null);
      } catch (err) {
        if (!isMounted) return;
        setError(
          getApiErrorMessage(err, 'Falha ao carregar o histórico de ciclos semanais.')
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  const closedCount = useMemo(
    () => weeks.filter((w) => w.status === 'CLOSED').length,
    [weeks]
  );
  const activeCount = useMemo(
    () => weeks.filter((w) => w.status === 'ACTIVE').length,
    [weeks]
  );
  const draftCount = useMemo(
    () => weeks.filter((w) => w.status === 'DRAFT').length,
    [weeks]
  );

  const filteredWeeks = useMemo(() => {
    if (filter === 'ALL') return weeks;
    return weeks.filter((w) => w.status === (filter as WeekStatus));
  }, [weeks, filter]);

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z"
                clipRule="evenodd"
              />
            </svg>
            Histórico &amp; Relatórios
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Histórico de Semanas
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Consulte ciclos anteriores, acompanhe o histórico cronológico e acesse relatórios
            consolidados e imutáveis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadWeeks()}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Atualizar
          </button>
          <Link
            href="/weeks"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            Novo Planejamento
          </Link>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total de Ciclos</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{weeks.length}</div>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Registrados na aplicação</p>
        </div>

        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-xs dark:border-indigo-900/60 dark:bg-indigo-950/20">
          <div className="text-xs font-medium text-indigo-800 dark:text-indigo-300">Semanas Concluídas</div>
          <div className="mt-1 text-2xl font-bold text-indigo-900 dark:text-indigo-200">{closedCount}</div>
          <p className="mt-1 text-xs text-indigo-600 dark:text-indigo-400">Com relatórios consolidados</p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs dark:border-emerald-900/60 dark:bg-emerald-950/20">
          <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">Em Andamento / Planejamento</div>
          <div className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-200">
            {activeCount + draftCount}
          </div>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">Ciclos abertos no momento</p>
        </div>
      </div>

      {/* Mensagens de Erro */}
      {error && (
        <Alert
          variant="error"
          title="Erro ao carregar histórico"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* Abas de Filtro */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs dark:bg-slate-100 dark:text-slate-900'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {`Todas (${weeks.length})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter('CLOSED')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'CLOSED'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {`Fechadas com Relatório (${closedCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter('ACTIVE')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {`Em Andamento (${activeCount})`}
          </button>
          <button
            type="button"
            onClick={() => setFilter('DRAFT')}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === 'DRAFT'
                ? 'bg-slate-600 text-white shadow-xs dark:bg-slate-600 dark:text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {`Planejamento (${draftCount})`}
          </button>
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500">
          Ordenação: mais recente para a mais antiga
        </span>
      </div>

      {/* Conteúdo: Lista ou Estados */}
      {isLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" label="Carregando histórico de ciclos semanais..." />
        </div>
      ) : weeks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
            Nenhum ciclo semanal registrado
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Assim que você criar e ativar semanas de metas, elas aparecerão listadas aqui em ordem
            cronológica.
          </p>
          <div className="mt-6">
            <Link
              href="/weeks"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Criar Primeiro Ciclo Semanal
            </Link>
          </div>
        </div>
      ) : filteredWeeks.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center space-y-3 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Nenhum ciclo encontrado com o filtro selecionado.
          </p>
          <button
            type="button"
            onClick={() => setFilter('ALL')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 underline transition-colors"
          >
            Limpar filtros e exibir todas as semanas
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredWeeks.map((week) => (
            <HistoryWeekCard key={week.id} week={week} />
          ))}
        </div>
      )}
    </div>
  );
}
