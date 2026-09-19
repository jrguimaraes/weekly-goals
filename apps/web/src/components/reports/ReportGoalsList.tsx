import React from 'react';
import { formatDate } from '../../lib/date-utils';
import type { GoalSnapshot } from '../../types/report';

interface ReportGoalsListProps {
  goals: GoalSnapshot[];
}

const priorityLabels: Record<string, string> = {
  HIGH: 'Alta',
  MEDIUM: 'Média',
  LOW: 'Baixa',
};

export function ReportGoalsList({ goals }: ReportGoalsListProps) {
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');
  const inProgressGoals = goals.filter((g) => g.status === 'IN_PROGRESS');
  const pendingGoals = goals.filter((g) => g.status === 'PENDING');

  function renderGoalRow(goal: GoalSnapshot) {
    const isExceeded = goal.type === 'QUANTITY' && goal.currentValue > goal.targetValue;
    const extra = isExceeded ? goal.currentValue - goal.targetValue : 0;
    const percentage =
      goal.targetValue > 0
        ? Math.round((goal.currentValue / goal.targetValue) * 100)
        : 0;

    const priorityText = priorityLabels[goal.priority] || goal.priority;
    const hasNotes = Boolean(goal.notes && goal.notes.trim().length > 0);

    return (
      <div
        key={goal.id}
        className="py-2.5 sm:py-3 print:py-2 border-b border-slate-200/90 dark:border-slate-800 print:border-slate-200 break-inside-avoid page-break-inside-avoid"
      >
        <div className="flex items-start justify-between gap-4 print-row">
          {/* Lado esquerdo: Título, Metadados, Descrição e Observações */}
          <div className="min-w-0 flex-1 space-y-1 print-main">
            {/* Linha 1: Ícone + Título */}
            <div className="flex items-center gap-2">
              <span
                className={`shrink-0 text-xs font-bold ${
                  goal.status === 'COMPLETED'
                    ? 'text-emerald-700 dark:text-emerald-400 print:text-emerald-800'
                    : 'text-indigo-700 dark:text-indigo-400 print:text-indigo-800'
                }`}
              >
                {goal.status === 'COMPLETED' ? '✓' : '●'}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 print:text-xs print:font-bold leading-tight">
                {goal.title}
              </h4>
            </div>

            {/* Linha 2: Categoria · Prioridade · Tipo · Data */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 pl-4 text-xs print:text-[10px] text-slate-600 dark:text-slate-300 print:text-slate-600">
              {goal.categoryName && (
                <span className="font-semibold text-slate-800 dark:text-slate-200 print:text-slate-900">
                  {goal.categoryName}
                </span>
              )}
              {goal.categoryName && <span>·</span>}
              <span>Prioridade {priorityText}</span>
              <span>·</span>
              <span>{goal.type === 'BINARY' ? 'Binária' : 'Quantitativa'}</span>
              {goal.completedAt && (
                <>
                  <span>·</span>
                  <span className="text-emerald-700 dark:text-emerald-400 print:text-emerald-800 font-medium">
                    Concluída em {formatDate(goal.completedAt)}
                  </span>
                </>
              )}
            </div>

            {/* Linha 3: Descrição (se houver) */}
            {goal.description && (
              <p className="pl-4 text-xs print:text-[10px] text-slate-700 dark:text-slate-300 print:text-slate-600 leading-relaxed">
                {goal.description}
              </p>
            )}

            {/* Linha 4: Observação / Contexto estilizado como nota complementar */}
            {hasNotes && (
              <div className="ml-4 mt-1 border-l-2 border-indigo-400 dark:border-indigo-500 pl-2.5 py-0.5 text-xs print:text-[10px] text-slate-700 dark:text-slate-300 bg-slate-50/90 dark:bg-slate-800/60 rounded-r print:bg-transparent print:border-indigo-600 print:pl-2 print:py-0 print:text-slate-600">
                <span className="font-semibold text-slate-900 dark:text-slate-100 print:text-slate-800 mr-1">
                  Observação:
                </span>
                <span className="italic whitespace-pre-wrap">{goal.notes}</span>
              </div>
            )}
          </div>

          {/* Lado direito: Resultado / Progresso numérico e destaque superado */}
          <div className="shrink-0 text-right print-aside pt-0.5">
            {goal.type === 'BINARY' ? (
              <span
                className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded print:text-[10px] border print:border-0 print:bg-transparent print:p-0 ${
                  goal.status === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 print:text-emerald-800'
                    : 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 print:text-slate-600'
                }`}
              >
                {goal.status === 'COMPLETED' ? 'Realizada · 100%' : 'Não realizada · 0%'}
              </span>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-sm font-bold print:text-xs ${
                    isExceeded
                      ? 'text-emerald-800 dark:text-emerald-300 font-extrabold print:text-emerald-900'
                      : 'text-slate-900 dark:text-slate-100'
                  }`}
                >
                  {`${goal.currentValue} de ${goal.targetValue} — ${percentage}%`}
                </span>
                {isExceeded && (
                  <span className="inline-flex items-center text-[10.5px] font-bold text-emerald-900 dark:text-emerald-300 print:text-emerald-800 bg-emerald-100/90 dark:bg-emerald-950/60 print:bg-transparent border border-emerald-300 print:border-0 px-2 py-0.5 rounded print:p-0">
                    {`★ Objetivo superado em +${extra}`}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 print:space-y-3">
      {/* 1. Metas Concluídas */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-300 dark:border-slate-700 print:border-slate-300 break-inside-avoid page-break-inside-avoid break-after-avoid page-break-after-avoid">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 font-bold dark:bg-emerald-950/60 dark:text-emerald-400 print:bg-transparent print:p-0 print:w-auto print:h-auto print:text-emerald-800">
            ✓
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 print:text-xs dark:text-slate-100 whitespace-nowrap">
            {`Metas Concluídas (${completedGoals.length})`}
          </h3>
        </div>

        {completedGoals.length === 0 ? (
          <div className="py-3 text-center text-xs text-slate-600 dark:text-slate-400">
            Nenhuma meta foi concluída integralmente neste ciclo.
          </div>
        ) : (
          <div>
            {completedGoals.map(renderGoalRow)}
          </div>
        )}
      </section>

      {/* 2. Metas Parciais */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-300 dark:border-slate-700 print:border-slate-300 break-inside-avoid page-break-inside-avoid break-after-avoid page-break-after-avoid">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-800 font-bold dark:bg-indigo-950/60 dark:text-indigo-400 print:bg-transparent print:p-0 print:w-auto print:h-auto print:text-indigo-800">
            ●
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 print:text-xs dark:text-slate-100 whitespace-nowrap">
            {`Metas Parciais (${inProgressGoals.length})`}
          </h3>
        </div>

        {inProgressGoals.length === 0 ? (
          <div className="py-3 text-center text-xs text-slate-600 dark:text-slate-400">
            Nenhuma meta parcial neste ciclo.
          </div>
        ) : (
          <div>
            {inProgressGoals.map(renderGoalRow)}
          </div>
        )}
      </section>

      {/* 3. Metas Não Realizadas */}
      <section className="space-y-1">
        <div className="flex items-center gap-2 pb-1 border-b border-slate-300 dark:border-slate-700 print:border-slate-300 break-inside-avoid page-break-inside-avoid break-after-avoid page-break-after-avoid">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-[10px] text-indigo-800 font-bold dark:bg-indigo-950/60 dark:text-indigo-400 print:bg-transparent print:p-0 print:w-auto print:h-auto print:text-indigo-800">
            ●
          </span>
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 print:text-xs dark:text-slate-100 whitespace-nowrap">
            {`Metas Não Realizadas (${pendingGoals.length})`}
          </h3>
        </div>

        {pendingGoals.length === 0 ? (
          <div className="py-3 text-center text-xs text-emerald-800 dark:text-emerald-400">
            Excelente! Nenhuma meta ficou sem realização neste ciclo.
          </div>
        ) : (
          <div>
            {pendingGoals.map(renderGoalRow)}
          </div>
        )}
      </section>
    </div>
  );
}
