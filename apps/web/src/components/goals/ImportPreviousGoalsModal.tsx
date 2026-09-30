'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { GoalPriorityBadge } from './GoalPriorityBadge';
import { goalsService } from '../../services/goals.service';
import { getApiErrorMessage } from '../../lib/api-client';
import { formatDateRange } from '../../lib/date-utils';
import type { Goal, ImportableGoalItem, ImportableGoalsResponse } from '../../types/goal';

interface ImportPreviousGoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekId: string;
  onSuccess: (importedGoals: Goal[]) => void;
}

interface ImportPreviousGoalsContentProps {
  onClose: () => void;
  weekId: string;
  onSuccess: (importedGoals: Goal[]) => void;
}

function ImportPreviousGoalsContent({
  onClose,
  weekId,
  onSuccess,
}: ImportPreviousGoalsContentProps) {
  const [data, setData] = useState<ImportableGoalsResponse | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    goalsService
      .getImportable(weekId)
      .then((res) => {
        if (isMounted) {
          setData(res);
          const availableIds = res.goals
            .filter((g) => !g.isAlreadyPresent)
            .map((g) => g.id);
          setSelectedIds(availableIds);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              'Não foi possível carregar as metas da semana anterior.'
            )
          );
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [weekId]);

  function handleToggleGoal(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function handleSelectAll() {
    if (!data) return;
    const availableIds = data.goals
      .filter((g) => !g.isAlreadyPresent)
      .map((g) => g.id);
    setSelectedIds(availableIds);
  }

  function handleDeselectAll() {
    setSelectedIds([]);
  }

  async function handleImport() {
    if (selectedIds.length === 0 || !weekId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const imported = await goalsService.importGoals(weekId, {
        goalIds: selectedIds,
      });
      onSuccess(imported);
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(err, 'Falha ao importar as metas selecionadas.')
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const availableGoals = data?.goals.filter((g) => !g.isAlreadyPresent) || [];
  const hasAvailableGoals = availableGoals.length > 0;
  const allAvailableSelected =
    hasAvailableGoals &&
    availableGoals.every((g) => selectedIds.includes(g.id));

  return (
    <div className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Buscando metas da semana anterior...
          </p>
        </div>
      )}

      {!isLoading && !data?.previousWeek && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Nenhuma semana anterior encontrada
          </h4>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Não há ciclo semanal anterior cadastrado no histórico para importar metas.
          </p>
        </div>
      )}

      {!isLoading && data?.previousWeek && data.goals.length === 0 && (
        <div className="space-y-3">
          <div className="rounded-lg bg-indigo-50/70 p-3 border border-indigo-100 text-xs dark:bg-indigo-950/30 dark:border-indigo-900/50">
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              Semana anterior identificada:{' '}
            </span>
            <span className="font-bold text-indigo-950 dark:text-indigo-100">
              {formatDateRange(
                data.previousWeek.startDate,
                data.previousWeek.endDate
              )}
            </span>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              A semana anterior não possui metas cadastradas para serem importadas.
            </p>
          </div>
        </div>
      )}

      {!isLoading && data?.previousWeek && data.goals.length > 0 && (
        <div className="space-y-4">
          {/* Header da semana anterior */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg bg-indigo-50/70 p-3 border border-indigo-100 text-xs dark:bg-indigo-950/30 dark:border-indigo-900/50">
            <div>
              <span className="font-medium text-slate-600 dark:text-slate-400">
                Semana anterior:{' '}
              </span>
              <span className="font-bold text-indigo-950 dark:text-indigo-100">
                {formatDateRange(
                  data.previousWeek.startDate,
                  data.previousWeek.endDate
                )}
              </span>
            </div>
            {hasAvailableGoals && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={
                    allAvailableSelected ? handleDeselectAll : handleSelectAll
                  }
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  {allAvailableSelected
                    ? 'Desmarcar todas'
                    : 'Selecionar todas'}
                </button>
              </div>
            )}
          </div>

          {/* Lista de Metas */}
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {data.goals.map((goal: ImportableGoalItem) => {
              const isSelected = selectedIds.includes(goal.id);
              const isDisabled = goal.isAlreadyPresent;

              return (
                <label
                  key={goal.id}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-xs transition-colors ${
                    isDisabled
                      ? 'border-slate-200 bg-slate-50/60 opacity-60 dark:border-slate-800 dark:bg-slate-900/30 cursor-not-allowed'
                      : isSelected
                      ? 'border-indigo-300 bg-indigo-50/40 dark:border-indigo-700 dark:bg-indigo-950/20 cursor-pointer'
                      : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/60 cursor-pointer'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => handleToggleGoal(goal.id)}
                    className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-700 cursor-pointer"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {goal.title}
                      </span>

                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                        {goal.category.name}
                      </span>

                      <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                        {goal.type === 'BINARY'
                          ? 'Binária (1x)'
                          : `${goal.targetValue}x`}
                      </span>

                      <GoalPriorityBadge priority={goal.priority} />

                      {goal.isAlreadyPresent && (
                        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          Já na semana
                        </span>
                      )}
                    </div>

                    {goal.description && (
                      <p className="mt-1 text-slate-500 dark:text-slate-400 line-clamp-1">
                        {goal.description}
                      </p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>

        {data?.previousWeek && data.goals.length > 0 && (
          <button
            type="button"
            onClick={handleImport}
            disabled={selectedIds.length === 0 || isSubmitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Importar metas selecionadas ({selectedIds.length})
          </button>
        )}
      </div>
    </div>
  );
}

export function ImportPreviousGoalsModal({
  isOpen,
  onClose,
  weekId,
  onSuccess,
}: ImportPreviousGoalsModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Importar Metas da Semana Anterior"
      description="Reutilize as metas planejadas no ciclo anterior nesta nova semana."
      maxWidth="lg"
    >
      <ImportPreviousGoalsContent
        key={weekId}
        onClose={onClose}
        weekId={weekId}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
