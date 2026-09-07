'use client';

import React from 'react';
import Link from 'next/link';
import { WeekStatusBadge } from '../weeks/WeekStatusBadge';
import { formatDate, formatDateRange } from '../../lib/date-utils';
import type { Week } from '../../types/week';

interface HistoryWeekCardProps {
  week: Week;
}

export function HistoryWeekCard({ week }: HistoryWeekCardProps) {
  const isClosed = week.status === 'CLOSED';
  const isActive = week.status === 'ACTIVE';

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs transition-all ${
        isClosed
          ? 'border-slate-200 bg-white hover:border-indigo-200 hover:shadow-sm'
          : isActive
          ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-200'
          : 'border-slate-200 bg-slate-50/40'
      }`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="text-base font-bold text-slate-900">
              {formatDateRange(week.startDate, week.endDate)}
            </h3>
            <WeekStatusBadge status={week.status} size="sm" />
            {isClosed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                    clipRule="evenodd"
                  />
                </svg>
                Relatório Disponível
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500">
            {isClosed ? (
              <p>
                Ciclo encerrado em{' '}
                <strong className="text-slate-700 font-semibold">
                  {week.closedAt ? formatDate(week.closedAt) : 'data não informada'}
                </strong>
                . Os dados deste ciclo estão consolidados e protegidos contra alterações.
              </p>
            ) : isActive ? (
              <p className="text-emerald-700 font-medium">
                Ciclo atualmente em andamento. O relatório analítico definitivo será gerado
                automaticamente no encerramento da semana.
              </p>
            ) : (
              <p className="text-slate-500">
                Ciclo cadastrado em fase de planejamento. O relatório será disponibilizado após
                ativação e encerramento.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          {isClosed ? (
            <>
              <Link
                href={`/weeks/${week.id}/report`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M15.5 2A1.5 1.5 0 0014 3.5v13a1.5 1.5 0 001.5 1.5h1a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0016.5 2h-1zM9.5 6A1.5 1.5 0 008 7.5v9A1.5 1.5 0 009.5 18h1a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 6h-1zM3.5 10A1.5 1.5 0 002 11.5v5A1.5 1.5 0 003.5 18h1A1.5 1.5 0 006 16.5v-5A1.5 1.5 0 004.5 10h-1z" />
                </svg>
                Ver Relatório
              </Link>
              <Link
                href={`/weeks/${week.id}`}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                Consultar Metas
              </Link>
            </>
          ) : isActive ? (
            <>
              <Link
                href="/"
                className="inline-flex items-center rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
              >
                Acompanhar no Painel
              </Link>
              <Link
                href={`/weeks/${week.id}`}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
              >
                Gerenciar Metas
              </Link>
            </>
          ) : (
            <Link
              href={`/weeks/${week.id}`}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              Ver Planejamento
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
