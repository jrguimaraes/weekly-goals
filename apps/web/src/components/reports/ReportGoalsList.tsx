import React from 'react';
import { GoalTypeBadge } from '../goals/GoalTypeBadge';
import { GoalPriorityBadge } from '../goals/GoalPriorityBadge';
import { GoalStatusBadge } from '../goals/GoalStatusBadge';
import { formatDate } from '../../lib/date-utils';
import type { GoalSnapshot } from '../../types/report';

interface ReportGoalsListProps {
  goals: GoalSnapshot[];
}

export function ReportGoalsList({ goals }: ReportGoalsListProps) {
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED');
  const incompleteGoals = goals.filter((g) => g.status !== 'COMPLETED');

  function renderGoalRow(goal: GoalSnapshot) {
    const percentage =
      goal.targetValue > 0
        ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
        : 0;

    return (
      <div
        key={goal.id}
        className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {goal.categoryName && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                {goal.categoryName}
              </span>
            )}
            <GoalTypeBadge type={goal.type} size="sm" />
            <GoalPriorityBadge priority={goal.priority} size="sm" />
            <GoalStatusBadge status={goal.status} size="sm" />
          </div>

          <div className="text-xs font-semibold text-slate-700">
            {`${percentage}% atingido`}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">{goal.title}</h4>
          {goal.description && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">{goal.description}</p>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 gap-2">
          <span>
            {goal.type === 'BINARY' ? (
              <>
                Critério de Sucesso:{' '}
                <strong className="text-slate-800 font-semibold">
                  {goal.status === 'COMPLETED' ? 'Realizada com Sucesso' : 'Não Realizada'}
                </strong>
              </>
            ) : (
              <>
                Resultado Final:{' '}
                <strong className="text-slate-800 font-semibold">{goal.currentValue}</strong> de{' '}
                <strong className="text-slate-800 font-semibold">{goal.targetValue}</strong>
              </>
            )}
          </span>

          {goal.completedAt && (
            <span className="text-slate-400">
              Concluída em {formatDate(goal.completedAt)}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Metas Concluídas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
              ✓
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {`Metas Concluídas (${completedGoals.length})`}
            </h3>
          </div>
        </div>

        {completedGoals.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-xs text-slate-500">
            Nenhuma meta foi concluída integralmente neste ciclo.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {completedGoals.map(renderGoalRow)}
          </div>
        )}
      </section>

      {/* Metas Incompletas / Pendentes */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
              !
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              {`Metas Incompletas ou Pendentes (${incompleteGoals.length})`}
            </h3>
          </div>
        </div>

        {incompleteGoals.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-xs text-emerald-700 bg-emerald-50/50">
            Excelente! 100% das metas planejadas foram concluídas neste ciclo.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {incompleteGoals.map(renderGoalRow)}
          </div>
        )}
      </section>
    </div>
  );
}
