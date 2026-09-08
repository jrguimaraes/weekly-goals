'use client';

import React from 'react';
import { GoalTypeBadge } from './GoalTypeBadge';
import { GoalPriorityBadge } from './GoalPriorityBadge';
import { GoalStatusBadge } from './GoalStatusBadge';
import { GoalProgressControl } from './GoalProgressControl';
import type { Goal } from '../../types/goal';

interface GoalCardProps {
  goal: Goal;
  isWeekClosed: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onProgressChange?: (goalId: string, newValue: number) => Promise<void>;
}

export function GoalCard({
  goal,
  isWeekClosed,
  onEdit,
  onDelete,
  onProgressChange,
}: GoalCardProps) {
  const percentage =
    goal.targetValue > 0
      ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100))
      : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {goal.category && (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                {goal.category.name}
              </span>
            )}
            <GoalTypeBadge type={goal.type} size="sm" />
            <GoalPriorityBadge priority={goal.priority} size="sm" />
            <GoalStatusBadge status={goal.status} size="sm" />
          </div>

          <h3 className="text-base font-semibold text-slate-900 leading-snug dark:text-slate-100">
            {goal.title}
          </h3>

          {goal.description && (
            <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
              {goal.description}
            </p>
          )}

          {/* Progresso e Alvo */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
              <span>
                {goal.type === 'BINARY' ? (
                  <>
                    Critério:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {goal.status === 'COMPLETED' ? 'Realizada' : 'Pendente'}
                    </strong>
                  </>
                ) : (
                  <>
                    Progresso:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {goal.currentValue}
                    </strong>{' '}
                    de{' '}
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {goal.targetValue}
                    </strong>
                  </>
                )}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{percentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className={`h-full transition-all duration-300 ${
                  goal.status === 'COMPLETED'
                    ? 'bg-emerald-500'
                    : goal.status === 'IN_PROGRESS'
                    ? 'bg-indigo-500'
                    : 'bg-slate-300 dark:bg-slate-700'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Controle de Progresso Ágil */}
          {onProgressChange && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Acompanhamento:</span>
              <GoalProgressControl
                goal={goal}
                isWeekClosed={isWeekClosed}
                onProgressChange={onProgressChange}
              />
            </div>
          )}
        </div>

        {/* Ações */}
        <div className="flex sm:flex-col items-center sm:items-end justify-end gap-2 shrink-0 pt-2 sm:pt-0">
          {isWeekClosed ? (
            <span className="text-xs text-slate-400 dark:text-slate-500 italic">
              Semana fechada (somente leitura)
            </span>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onEdit(goal)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={() => onDelete(goal)}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
