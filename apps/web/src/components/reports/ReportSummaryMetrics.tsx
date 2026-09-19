import React from 'react';
import type { ReportSnapshot } from '../../types/report';

interface ReportSummaryMetricsProps {
  report: ReportSnapshot;
}

export function ReportSummaryMetrics({ report }: ReportSummaryMetricsProps) {
  const incompleteGoals = Math.max(0, report.totalGoals - report.completedGoals);
  const formattedProgress = `${report.progressRate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  const formattedCompletion = `${report.completionRate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

  return (
    <div className="space-y-1.5 break-inside-avoid page-break-inside-avoid print:border-b print:border-slate-200 print:pb-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 print:text-slate-900 dark:text-slate-200">
        Resumo Geral
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:grid-cols-4 print:gap-4">
        <div className="rounded-lg border border-slate-300 bg-white p-2.5 print:p-0 print:border-0 print:bg-transparent print:rounded-none dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300 print:text-slate-600 block">
            Progresso Geral
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 print:text-xl dark:text-slate-100">
            {formattedProgress}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 truncate print:text-[10px] print:text-slate-500">
            Média de avanço das metas
          </p>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-2.5 print:p-0 print:border-0 print:bg-transparent print:rounded-none dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300 print:text-slate-600 block">
            Taxa de Conclusão
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-emerald-700 print:text-emerald-800 dark:text-emerald-400 print:text-xl">
            {formattedCompletion}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 truncate print:text-[10px] print:text-slate-500">
            Metas 100% cumpridas
          </p>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-2.5 print:p-0 print:border-0 print:bg-transparent print:rounded-none dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300 print:text-slate-600 block">
            Metas Concluídas
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-slate-900 print:text-xl dark:text-slate-100">
            {`${report.completedGoals} / ${report.totalGoals}`}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 truncate print:text-[10px] print:text-slate-500">
            {report.completedGoals === 1 ? '1 meta finalizada' : `${report.completedGoals} metas finalizadas`}
          </p>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-2.5 print:p-0 print:border-0 print:bg-transparent print:rounded-none dark:border-slate-800 dark:bg-slate-900">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300 print:text-slate-600 block">
            Metas Não Concluídas
          </span>
          <div className="mt-1 text-xl sm:text-2xl font-bold text-amber-700 print:text-amber-800 dark:text-amber-400 print:text-xl">
            {incompleteGoals}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400 truncate print:text-[10px] print:text-slate-500">
            {incompleteGoals === 0 ? 'Todas concluídas' : incompleteGoals === 1 ? '1 meta não concluída' : `${incompleteGoals} metas não concluídas`}
          </p>
        </div>
      </div>
    </div>
  );
}
