'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { weeksService } from '../../services/weeks.service';
import { WeekList } from '../../components/weeks/WeekList';
import { CreateWeekModal } from '../../components/weeks/CreateWeekModal';
import { ActivateWeekModal } from '../../components/weeks/ActivateWeekModal';
import { CloseWeekModal } from '../../components/weeks/CloseWeekModal';
import { WeekStatusBadge } from '../../components/weeks/WeekStatusBadge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Alert } from '../../components/ui/Alert';
import { getApiErrorMessage } from '../../lib/api-client';
import { formatDateRange } from '../../lib/date-utils';
import type { Week, WeekStatus } from '../../types/week';

type FilterOption = 'all' | 'DRAFT' | 'ACTIVE' | 'CLOSED';

export default function WeeksPage() {
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'info' } | null>(null);

  const [filter, setFilter] = useState<FilterOption>('all');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activatingWeek, setActivatingWeek] = useState<Week | null>(null);
  const [closingWeek, setClosingWeek] = useState<Week | null>(null);

  const loadWeeks = useCallback(async (currentFilter: FilterOption) => {
    setIsLoading(true);
    setError(null);
    try {
      const statusParam = currentFilter === 'all' ? undefined : (currentFilter as WeekStatus);
      const data = await weeksService.list(statusParam);
      setWeeks(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as semanas cadastradas.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const statusParam = filter === 'all' ? undefined : (filter as WeekStatus);
        const data = await weeksService.list(statusParam);
        if (isMounted) {
          setWeeks(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Não foi possível carregar as semanas cadastradas.'));
        }
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
  }, [filter]);

  function handleFilterChange(newFilter: FilterOption) {
    setFilter(newFilter);
  }

  function handleOpenCreate() {
    setIsCreateOpen(true);
  }

  function handleOpenActivate(week: Week) {
    setActivatingWeek(week);
  }

  function handleCreateSuccess(createdWeek: Week) {
    setFeedback({
      message: `Ciclo semanal (${formatDateRange(createdWeek.startDate, createdWeek.endDate)}) cadastrado com sucesso em planejamento.`,
      variant: 'success',
    });
    loadWeeks(filter);
  }

  function handleActivateSuccess(activatedWeek: Week) {
    setFeedback({
      message: `Ciclo semanal (${formatDateRange(activatedWeek.startDate, activatedWeek.endDate)}) ativado com sucesso!`,
      variant: 'success',
    });
    loadWeeks(filter);
  }

  function handleOpenClose(week: Week) {
    setClosingWeek(week);
  }

  function handleCloseSuccess(closedWeek: Week) {
    setFeedback({
      message: `Ciclo semanal (${formatDateRange(closedWeek.startDate, closedWeek.endDate)}) encerrado com sucesso. Metas congeladas e relatório gerado.`,
      variant: 'success',
    });
    loadWeeks(filter);
  }

  // Identifica a semana ativa no sistema (se houver)
  const activeWeek = weeks.find((w) => w.status === 'ACTIVE');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            Planejamento Semanal
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Ciclos estritos de 7 dias. Cadastre semanas em planejamento e ative a semana atual para execução.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Novo Ciclo Semanal
        </button>
      </div>

      {feedback && (
        <Alert
          variant={feedback.variant}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {error && (
        <div className="space-y-3">
          <Alert variant="error" message={error} />
          <button
            type="button"
            onClick={() => loadWeeks(filter)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Destaque do Ciclo Ativo */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Ciclo Semanal em Execução
            </h2>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
              (Máximo de 1 semana ativa por vez)
            </span>
          </div>
          {activeWeek && <WeekStatusBadge status="ACTIVE" size="sm" />}
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          {activeWeek ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-lg bg-emerald-50/60 p-4 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-800/60">
              <div>
                <div className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                  {formatDateRange(activeWeek.startDate, activeWeek.endDate)}
                </div>
                <div className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  Semana em andamento. O progresso das metas vinculadas a este ciclo está ativo.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-2xs dark:bg-slate-800 dark:border-emerald-700/60 dark:text-emerald-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Ativa
                </span>
                <Link
                  href={`/weeks/${activeWeek.id}`}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                >
                  Ver Metas
                </Link>
                <button
                  type="button"
                  onClick={() => handleOpenClose(activeWeek)}
                  className="rounded-lg border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Encerrar Semana
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200 text-xs text-slate-600 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Nenhum ciclo semanal ativo no momento.</span>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                  Selecione uma semana em planejamento (DRAFT) abaixo e clique em &quot;Ativar Semana&quot; para iniciar.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Listagem geral de ciclos */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-2">Filtrar por Status:</span>
          <button
            type="button"
            onClick={() => handleFilterChange('all')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('ACTIVE')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'ACTIVE'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Ativas (ACTIVE)
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('DRAFT')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'DRAFT'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Em Planejamento (DRAFT)
          </button>
          <button
            type="button"
            onClick={() => handleFilterChange('CLOSED')}
            className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
              filter === 'CLOSED'
                ? 'bg-slate-700 text-white dark:bg-slate-600 dark:text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Fechadas (CLOSED)
          </button>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <LoadingSpinner size="lg" label="Carregando semanas..." />
          </div>
        ) : (
          <WeekList
            weeks={weeks}
            onActivate={handleOpenActivate}
            onCloseWeek={handleOpenClose}
          />
        )}
      </section>

      <CreateWeekModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <ActivateWeekModal
        isOpen={Boolean(activatingWeek)}
        onClose={() => setActivatingWeek(null)}
        week={activatingWeek}
        onSuccess={handleActivateSuccess}
      />

      <CloseWeekModal
        isOpen={Boolean(closingWeek)}
        onClose={() => setClosingWeek(null)}
        week={closingWeek}
        onSuccess={handleCloseSuccess}
      />
    </div>
  );
}
