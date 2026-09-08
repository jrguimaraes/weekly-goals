'use client';

import React from 'react';
import Link from 'next/link';
import { WeekStatusBadge } from './WeekStatusBadge';
import { formatDate, formatDateRange } from '../../lib/date-utils';
import type { Week } from '../../types/week';

interface WeekCardProps {
  week: Week;
  onActivate: (week: Week) => void;
  onCloseWeek?: (week: Week) => void;
  isFeatured?: boolean;
}

export function WeekCard({
  week,
  onActivate,
  onCloseWeek,
  isFeatured = false,
}: WeekCardProps) {
  const isDraft = week.status === 'DRAFT';
  const isActive = week.status === 'ACTIVE';
  const isClosed = week.status === 'CLOSED';

  return (
    <div
      className={`rounded-xl border bg-white p-5 shadow-xs transition-all dark:bg-slate-900 ${
        isActive
          ? 'border-emerald-300 ring-1 ring-emerald-200 dark:border-emerald-700/80 dark:ring-emerald-800/60'
          : isFeatured
          ? 'border-indigo-300 ring-1 ring-indigo-100 dark:border-indigo-800/80 dark:ring-indigo-900/60'
          : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              {formatDateRange(week.startDate, week.endDate)}
            </h3>
            <WeekStatusBadge status={week.status} size="sm" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isDraft && 'Cadastrada em planejamento. Ative quando estiver pronto para iniciar a semana.'}
            {isActive && 'Ciclo semanal atualmente ativo e em execução operacional.'}
            {isClosed && (
              <>
                Ciclo encerrado em{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {week.closedAt ? formatDate(week.closedAt) : 'data não informada'}
                </strong>
                . Dados congelados.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 pt-2 sm:pt-0">
          <Link
            href={`/weeks/${week.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {isClosed ? 'Ver Metas' : 'Gerenciar Metas'}
          </Link>

          {isDraft && (
            <button
              type="button"
              onClick={() => onActivate(week)}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Ativar Semana
            </button>
          )}

          {isActive && (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Em Andamento
              </span>
              {onCloseWeek && (
                <button
                  type="button"
                  onClick={() => onCloseWeek(week)}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                >
                  Encerrar Semana
                </button>
              )}
            </>
          )}

          {isClosed && (
            <>
              <Link
                href={`/weeks/${week.id}/report`}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-100 dark:bg-indigo-950/60 dark:border-indigo-800/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
              >
                Ver Relatório
              </Link>
              <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400">
                Histórico
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
