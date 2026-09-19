import React from 'react';
import type { ReportSnapshot } from '../../types/report';

interface ReportHighlightsProps {
  report: ReportSnapshot;
}

export function ReportHighlights({ report }: ReportHighlightsProps) {
  // 1. Pontos Positivos (estritamente metas de alta prioridade concluídas ou metas que superaram o valor)
  const positiveHighlights: { key: string; text: React.ReactNode }[] = [];

  const positiveGoals = report.goals.filter((g) => {
    const isHighCompleted = g.status === 'COMPLETED' && g.priority === 'HIGH';
    const isExceeded = g.type === 'QUANTITY' && g.currentValue > g.targetValue;
    return isHighCompleted || isExceeded;
  });

  for (const goal of positiveGoals) {
    const isExceeded = goal.type === 'QUANTITY' && goal.currentValue > goal.targetValue;

    if (isExceeded) {
      const extra = goal.currentValue - goal.targetValue;
      const percentage =
        goal.targetValue > 0
          ? Math.round((goal.currentValue / goal.targetValue) * 100)
          : 0;

      positiveHighlights.push({
        key: `pos-${goal.id}`,
        text: (
          <span>
            <strong>{goal.title}</strong>
            {goal.priority === 'HIGH' ? ' (Alta prioridade)' : ''}{' '}
            {`superou o objetivo em `}<strong>{`+${extra}`}</strong>{' '}
            {`(${goal.currentValue} de ${goal.targetValue} — ${percentage}%).`}
          </span>
        ),
      });
    } else {
      // Alta prioridade concluída (sem exceder)
      positiveHighlights.push({
        key: `pos-${goal.id}`,
        text: (
          <span>
            <strong>{goal.title}</strong> (Alta prioridade): meta concluída com sucesso
            {goal.type === 'QUANTITY' ? ` (${goal.currentValue} de ${goal.targetValue} — 100%).` : '.'}
          </span>
        ),
      });
    }
  }

  if (positiveHighlights.length === 0) {
    positiveHighlights.push({
      key: 'no-positive',
      text: <span>Nenhuma meta de alta prioridade concluída ou superada neste ciclo.</span>,
    });
  }

  // 2. Pontos de Atenção
  const attentionHighlights: { key: string; text: React.ReactNode }[] = [];

  // Metas não realizadas
  const pendingGoals = report.goals.filter((g) => g.status === 'PENDING');
  if (pendingGoals.length > 0) {
    attentionHighlights.push({
      key: 'pending-summary',
      text: (
        <span>
          <strong>{`${pendingGoals.length} ${pendingGoals.length === 1 ? 'meta não realizada' : 'metas não realizadas'}`}</strong> {`no período.`}
        </span>
      ),
    });
  }

  // Categorias com baixa conclusão (< 50%)
  const lowCategories = report.categories.filter(
    (c) => c.totalGoals > 0 && c.completionRate < 50
  );
  for (const cat of lowCategories) {
    attentionHighlights.push({
      key: `low-cat-${cat.categoryId}`,
      text: (
        <span>
          <strong>{`${cat.categoryName}:`}</strong> {`conclusão de ${cat.completionRate}% (${cat.completedGoals} de ${cat.totalGoals} ${cat.totalGoals === 1 ? 'meta cumprida' : 'metas cumpridas'}).`}
        </span>
      ),
    });
  }

  if (attentionHighlights.length === 0) {
    attentionHighlights.push({
      key: 'no-attention',
      text: <span>Nenhum ponto crítico identificado. Excelente ritmo de execução!</span>,
    });
  }

  return (
    <div className="space-y-1.5 break-inside-avoid page-break-inside-avoid print:border-b print:border-slate-200 print:pb-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 print:text-slate-900 dark:text-slate-200">
        Destaques da Semana
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 print:grid-cols-2 print:gap-x-8 print:gap-y-3">
        {/* Coluna 1: Pontos Positivos */}
        <div className="rounded-lg border border-emerald-300 bg-white p-3 print:p-0 print:border-0 print:bg-transparent print:rounded-none dark:border-emerald-800/80 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300 print:text-emerald-900">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 print:bg-transparent print:p-0 print:w-auto print:h-auto print:text-emerald-800 font-bold">
              ✓
            </span>
            Pontos Positivos
          </div>
          <ul className="space-y-1.5 text-xs print:text-[10px] text-slate-800 dark:text-slate-200 print:text-slate-700 leading-snug">
            {positiveHighlights.map((h) => (
              <li key={h.key} className="flex items-start gap-1.5">
                <span className="text-emerald-600 dark:text-emerald-400 print:text-emerald-700 mt-0.5">•</span>
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 2: Pontos de Atenção */}
        <div className="rounded-lg border border-amber-300 bg-white p-3 print:p-0 print:border-0 print:bg-transparent print:rounded-none dark:border-amber-800/80 dark:bg-slate-900">
          <div className="flex items-center gap-1.5 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 print:text-amber-900">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-100 text-[10px] text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 print:bg-transparent print:p-0 print:w-auto print:h-auto print:text-amber-800 font-bold">
              !
            </span>
            Pontos de Atenção
          </div>
          <ul className="space-y-1.5 text-xs print:text-[10px] text-slate-800 dark:text-slate-200 print:text-slate-700 leading-snug">
            {attentionHighlights.map((h) => (
              <li key={h.key} className="flex items-start gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 print:text-amber-700 mt-0.5">•</span>
                <span>{h.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
