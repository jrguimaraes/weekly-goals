'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { recurringGoalsService } from '../../services/recurring-goals.service';
import { categoriesService } from '../../services/categories.service';
import { RecurringGoalFormModal } from '../../components/recurring-goals/RecurringGoalFormModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { GoalPriorityBadge } from '../../components/goals/GoalPriorityBadge';
import { getApiErrorMessage } from '../../lib/api-client';
import type { RecurringGoal } from '../../types/recurring-goal';
import type { Category } from '../../types/category';

export default function RecurringGoalsPage() {
  const [recurringGoals, setRecurringGoals] = useState<RecurringGoal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<RecurringGoal | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [goalsData, catsData] = await Promise.all([
        recurringGoalsService.list(),
        categoriesService.list(true),
      ]);
      setRecurringGoals(goalsData);
      setCategories(catsData);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as metas recorrentes.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const [goalsData, catsData] = await Promise.all([
          recurringGoalsService.list(),
          categoriesService.list(true),
        ]);
        if (isMounted) {
          setRecurringGoals(goalsData);
          setCategories(catsData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Não foi possível carregar as metas recorrentes.'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleToggle(goal: RecurringGoal) {
    setTogglingId(goal.id);
    setError(null);
    try {
      const updated = await recurringGoalsService.toggleActive(goal.id);
      setRecurringGoals((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setFeedback(
        `Meta "${updated.title}" ${updated.active ? 'reativada' : 'pausada'} com sucesso.`
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao alterar status da meta recorrente.'));
    } finally {
      setTogglingId(null);
    }
  }

  function handleOpenCreate() {
    setEditingGoal(null);
    setIsModalOpen(true);
  }

  function handleOpenEdit(goal: RecurringGoal) {
    setEditingGoal(goal);
    setIsModalOpen(true);
  }

  function handleSaved(saved: RecurringGoal) {
    setFeedback(`Meta recorrente "${saved.title}" salva com sucesso.`);
    loadData();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Metas Recorrentes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Metas que são adicionadas automaticamente a cada nova semana em planejamento (DRAFT).
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nova Meta Recorrente
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
      {feedback && (
        <Alert
          variant="success"
          message={feedback}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : recurringGoals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
            Nenhuma meta recorrente cadastrada
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Ao criar metas semanais, marque &quot;Repetir semanalmente&quot; ou cadastre metas recorrentes aqui diretamente.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Criar primeira meta recorrente
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <ul className="divide-y divide-slate-200 dark:divide-slate-800">
            {recurringGoals.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {item.title}
                    </span>
                    {item.category && (
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {item.category.name}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
                      {item.type === 'QUANTITY' ? `${item.targetValue}x` : 'Binária (1x)'}
                    </span>
                    <GoalPriorityBadge priority={item.priority} />
                    <Badge variant={item.active ? 'success' : 'neutral'}>
                      {item.active ? 'Ativa' : 'Pausada'}
                    </Badge>
                  </div>
                  {item.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={togglingId === item.id}
                    onClick={() => handleToggle(item)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors disabled:opacity-50 ${
                      item.active
                        ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {togglingId === item.id ? (
                      <LoadingSpinner size="sm" />
                    ) : item.active ? (
                      'Pausar'
                    ) : (
                      'Reativar'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  >
                    Editar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Modal */}
      <RecurringGoalFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recurringGoal={editingGoal}
        categories={categories}
        onSuccess={handleSaved}
      />
    </div>
  );
}
