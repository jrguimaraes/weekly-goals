'use client';

import React from 'react';
import { GoalPriorityBadge } from './GoalPriorityBadge';
import { GoalProgressControl } from './GoalProgressControl';
import type { Goal } from '../../types/goal';

interface GoalCardProps {
  goal: Goal;
  isWeekClosed: boolean;
  onEdit?: (goal: Goal) => void;
  onDelete?: (goal: Goal) => void;
  onProgressChange?: (goalId: string, newValue: number) => Promise<void>;
}

export function GoalCard({
  goal,
  isWeekClosed,
  onEdit,
  onDelete,
  onProgressChange,
}: GoalCardProps) {
  const isExceeded = goal.type === 'QUANTITY' && goal.currentValue > goal.targetValue;
  const extraValue = isExceeded ? goal.currentValue - goal.targetValue : 0;
  const percentage =
    goal.targetValue > 0
      ? Math.round((goal.currentValue / goal.targetValue) * 100)
      : 0;
  const barWidth = Math.min(100, Math.max(0, percentage));

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border p-4 shadow-xs transition-all hover:shadow-md h-full ${
        isExceeded
          ? 'border-emerald-300 bg-linear-to-b from-emerald-50/50 via-white to-white ring-1 ring-emerald-400/40 hover:border-emerald-400 dark:border-emerald-700/70 dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-900 dark:hover:border-emerald-600'
          : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700'
      }`}
    >
      <div className="space-y-3">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-1.5">
          {goal.category && (
            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60">
              {goal.category.name}
            </span>
          )}
          <GoalPriorityBadge priority={goal.priority} size="sm" />
          {isExceeded && (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3 w-3 text-emerald-600 dark:text-emerald-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Superada {`(+${extraValue})`}
            </span>
          )}
        </div>

        {/* Título e Descrição */}
        <div>
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug dark:text-slate-100">
            {goal.title}
          </h3>

          {goal.description && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed dark:text-slate-400">
              {goal.description}
            </p>
          )}
        </div>

        {/* Progresso e Alvo */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
            <span className="truncate pr-2">
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
                  <strong
                    className={`font-semibold ${
                      isExceeded
                        ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {goal.currentValue}
                  </strong>{' '}
                  de{' '}
                  <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                    {goal.targetValue}
                  </strong>
                  {isExceeded && (
                    <span className="ml-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {`(+${extraValue})`}
                    </span>
                  )}
                </>
              )}
            </span>
            <span
              className={`font-semibold shrink-0 ${
                isExceeded
                  ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                  : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              {`${percentage}%`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full transition-all duration-300 ${
                isExceeded
                  ? 'bg-linear-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300'
                  : goal.status === 'COMPLETED'
                  ? 'bg-emerald-500'
                  : goal.status === 'IN_PROGRESS'
                  ? 'bg-indigo-500'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              style={{ width: `${barWidth}%` }}
            />
          </div>
        </div>
      </div>

      {/* Rodapé: Acompanhamento e Ações */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        {onProgressChange && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Acompanhamento:</span>
            <GoalProgressControl
              goal={goal}
              isWeekClosed={isWeekClosed}
              onProgressChange={onProgressChange}
            />
          </div>
        )}

        {(onEdit || onDelete || isWeekClosed) && (
          <div className="flex items-center justify-end gap-2 pt-1">
            {isWeekClosed ? (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                Semana fechada (somente leitura)
              </span>
            ) : (
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => onEdit(goal)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(goal)}
                    className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50 dark:border-rose-900/60 dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
