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
      className={`rounded-xl border bg-white p-5 shadow-xs transition-all ${
        isActive
          ? 'border-emerald-300 ring-1 ring-emerald-200'
          : isFeatured
          ? 'border-indigo-300 ring-1 ring-indigo-100'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-900">
              {formatDateRange(week.startDate, week.endDate)}
            </h3>
            <WeekStatusBadge status={week.status} size="sm" />
          </div>
          <p className="text-xs text-slate-500">
            {isDraft && 'Cadastrada em planejamento. Ative quando estiver pronto para iniciar a semana.'}
            {isActive && 'Ciclo semanal atualmente ativo e em execução operacional.'}
            {isClosed && (
              <>
                Ciclo encerrado em{' '}
                <strong className="text-slate-700">
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
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
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
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                Em Andamento
              </span>
              {onCloseWeek && (
                <button
                  type="button"
                  onClick={() => onCloseWeek(week)}
                  className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50 transition-colors"
                >
                  Encerrar Semana
                </button>
              )}
            </>
          )}

          {isClosed && (
            <span className="inline-flex items-center text-xs font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              Histórico
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
