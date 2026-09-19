'use client';

import React from 'react';
import Link from 'next/link';
import { formatDate, formatDateRange, formatReportFileName } from '../../lib/date-utils';
import type { ReportSnapshot } from '../../types/report';

interface ReportHeaderProps {
  report: ReportSnapshot;
}

export function ReportHeader({ report }: ReportHeaderProps) {
  function handlePrint() {
    if (typeof window !== 'undefined') {
      const fileName = formatReportFileName(report.week.startDate, report.week.endDate);
      const originalTitle =
        typeof document !== 'undefined' && document.title && !document.title.startsWith('wg-')
          ? document.title
          : 'Weekly Goals';
      const wasDark = document.documentElement.classList.contains('dark');
      if (wasDark) {
        document.documentElement.classList.remove('dark');
      }
      document.title = fileName;
      window.print();
      setTimeout(() => {
        document.title = originalTitle;
        if (wasDark) {
          document.documentElement.classList.add('dark');
        }
      }, 500);
    }
  }

  const closedDate = report.week.closedAt
    ? formatDate(report.week.closedAt)
    : formatDate(report.generatedAt);

  const periodRange = formatDateRange(report.week.startDate, report.week.endDate);

  return (
    <div className="space-y-3 border-b border-slate-200 pb-3 print:border-b print:border-slate-300 print:pb-2.5 dark:border-slate-800">
      {/* Ações de tela (ocultadas na impressão) */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href={`/weeks/${report.week.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L6.414 9H17a1 1 0 110 2H6.414l3.293 3.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Voltar para a Semana
        </Link>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z"
              clipRule="evenodd"
            />
          </svg>
          Imprimir / Salvar PDF
        </button>
      </div>

      {/* Cabeçalho limpo do documento */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div className="space-y-0.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 print:text-indigo-800">
            Weekly Goals · Retrospectiva Semanal
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 print:text-xl dark:text-slate-100">
            Resumo da Semana
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-700 print:text-slate-800 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {`Período: ${periodRange}`}
            </span>
            <span>·</span>
            <span>{`Semana encerrada em ${closedDate}`}</span>
          </div>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 print:border-0 print:bg-transparent print:p-0 print:text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 print:bg-emerald-700" />
            Semana Fechada
          </span>
        </div>
      </div>
    </div>
  );
}
