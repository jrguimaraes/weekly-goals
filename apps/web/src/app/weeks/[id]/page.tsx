'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { weeksService } from '../../../services/weeks.service';
import { goalsService } from '../../../services/goals.service';
import { categoriesService } from '../../../services/categories.service';
import { WeekStatusBadge } from '../../../components/weeks/WeekStatusBadge';
import { GoalList } from '../../../components/goals/GoalList';
import { GoalFormModal } from '../../../components/goals/GoalFormModal';
import { DeleteGoalModal } from '../../../components/goals/DeleteGoalModal';
import { CloseWeekModal } from '../../../components/weeks/CloseWeekModal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Alert } from '../../../components/ui/Alert';
import { getApiErrorMessage } from '../../../lib/api-client';
import { formatDateRange } from '../../../lib/date-utils';
import type { Week } from '../../../types/week';
import type { Goal, GoalStatus } from '../../../types/goal';
import type { Category } from '../../../types/category';

export default function WeekGoalsPage() {
  const params = useParams();
  const weekId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [week, setWeek] = useState<Week | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'info' } | null>(null);

  // Filtros
  const [selectedCategoryId, setSelectedCategoryId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modais
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const loadData = useCallback(
    async (catId: string, status: string) => {
      if (!weekId) return;
      setError(null);
      try {
        const filters = {
          categoryId: catId !== 'all' ? catId : undefined,
          status: status !== 'all' ? (status as GoalStatus) : undefined,
        };

        const [weekData, goalsData, categoriesData] = await Promise.all([
          weeksService.getById(weekId),
          goalsService.listByWeek(weekId, filters),
          categoriesService.list(true),
        ]);

        setWeek(weekData);
        setGoals(goalsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(getApiErrorMessage(err, 'Falha ao carregar as metas e detalhes da semana.'));
      } finally {
        setIsLoading(false);
      }
    },
    [weekId]
  );

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      if (!weekId) return;
      try {
        const filters = {
          categoryId: selectedCategoryId !== 'all' ? selectedCategoryId : undefined,
          status: selectedStatus !== 'all' ? (selectedStatus as GoalStatus) : undefined,
        };

        const [weekData, goalsData, categoriesData] = await Promise.all([
          weeksService.getById(weekId),
          goalsService.listByWeek(weekId, filters),
          categoriesService.list(true),
        ]);

        if (isMounted) {
          setWeek(weekData);
          setGoals(goalsData);
          setCategories(categoriesData);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Falha ao carregar as metas e detalhes da semana.'));
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
  }, [weekId, selectedCategoryId, selectedStatus]);

  function handleCategoryFilterChange(newCatId: string) {
    setSelectedCategoryId(newCatId);
  }

  function handleStatusFilterChange(newStatus: string) {
    setSelectedStatus(newStatus);
  }

  function handleOpenCreate() {
    setEditingGoal(null);
    setIsFormModalOpen(true);
  }

  function handleOpenEdit(goal: Goal) {
    setEditingGoal(goal);
    setIsFormModalOpen(true);
  }

  function handleOpenDelete(goal: Goal) {
    setDeletingGoal(goal);
  }

  function handleFormSuccess(savedGoal: Goal) {
    setFeedback({
      message: editingGoal
        ? `Meta "${savedGoal.title}" atualizada com sucesso!`
        : `Meta "${savedGoal.title}" cadastrada com sucesso!`,
      variant: 'success',
    });
    loadData(selectedCategoryId, selectedStatus);
  }

  function handleDeleteSuccess(deleted: Goal) {
    setFeedback({
      message: `Meta "${deleted.title}" removida com sucesso.`,
      variant: 'info',
    });
    loadData(selectedCategoryId, selectedStatus);
  }

  async function handleProgressChange(goalId: string, newCurrentValue: number) {
    try {
      const updatedGoal = await goalsService.updateProgress(goalId, newCurrentValue);
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? updatedGoal : g))
      );
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao atualizar o progresso da meta.'));
      throw err;
    }
  }

  function handleCloseWeekSuccess(closedWeek: Week) {
    setWeek(closedWeek);
    setFeedback({
      message: 'Ciclo semanal encerrado com sucesso. Metas permanentemente congeladas e snapshot do relatório consolidado.',
      variant: 'info',
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium">Carregando metas da semana...</p>
      </div>
    );
  }

  if (error && !week) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/weeks" className="hover:text-indigo-600 transition-colors">
            ← Voltar para Planejamento Semanal
          </Link>
        </div>
        <Alert variant="error" message={error} />
      </div>
    );
  }

  if (!week) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/weeks" className="hover:text-indigo-600 transition-colors">
            ← Voltar para Planejamento Semanal
          </Link>
        </div>
        <Alert variant="warning" message="Semana não encontrada." />
      </div>
    );
  }

  const isClosed = week.status === 'CLOSED';
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === 'COMPLETED').length;
  const inProgressGoals = goals.filter((g) => g.status === 'IN_PROGRESS').length;
  const pendingGoals = goals.filter((g) => g.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Navegação e Voltar */}
      <div className="flex items-center justify-between">
        <Link
          href="/weeks"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
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
          Voltar para Semanas
        </Link>
        <WeekStatusBadge status={week.status} size="sm" />
      </div>

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {formatDateRange(week.startDate, week.endDate)}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gerencie as metas associadas a este ciclo semanal.
          </p>
        </div>

        {!isClosed && (
          <div className="flex flex-wrap items-center gap-3">
            {week.status === 'ACTIVE' && (
              <button
                type="button"
                onClick={() => setIsCloseModalOpen(true)}
                className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50 transition-colors"
              >
                Encerrar Semana
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Nova Meta
            </button>
          </div>
        )}
      </div>

      {/* Alertas contextuais de status */}
      {isClosed && (
        <Alert
          variant="info"
          message="Esta semana está encerrada. Os dados e metas estão congelados em modo histórico para relatórios e não podem ser alterados."
        />
      )}
      {week.status === 'DRAFT' && (
        <Alert
          variant="warning"
          message="Esta semana está em planejamento. Cadastre suas metas e, quando estiver pronto para iniciar, realize a ativação na tela de Semanas."
        />
      )}
      {week.status === 'ACTIVE' && (
        <Alert
          variant="success"
          message="Semana ativa em execução operacional. Acompanhe e cumpra suas metas programadas."
        />
      )}

      {/* Notificações de feedback */}
      {feedback && (
        <Alert
          variant={feedback.variant}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}
      {error && <Alert variant="error" message={error} />}

      {/* Cards de Métricas da Semana */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total de Metas</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{totalGoals}</p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-emerald-700">Concluídas</p>
          <p className="mt-1 text-2xl font-bold text-emerald-800">{completedGoals}</p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 shadow-xs">
          <p className="text-xs font-medium text-indigo-700">Em Progresso</p>
          <p className="mt-1 text-2xl font-bold text-indigo-800">{inProgressGoals}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Pendentes</p>
          <p className="mt-1 text-2xl font-bold text-slate-700">{pendingGoals}</p>
        </div>
      </div>

      {/* Listagem de Metas com Filtros */}
      <GoalList
        goals={goals}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        selectedStatus={selectedStatus}
        onCategoryChange={handleCategoryFilterChange}
        onStatusChange={handleStatusFilterChange}
        isWeekClosed={isClosed}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onAddNew={handleOpenCreate}
        onProgressChange={handleProgressChange}
      />

      {/* Modal de Criação / Edição */}
      <GoalFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingGoal(null);
        }}
        weekId={week.id}
        goal={editingGoal}
        categories={categories}
        onSuccess={handleFormSuccess}
      />

      {/* Modal de Exclusão */}
      <DeleteGoalModal
        isOpen={Boolean(deletingGoal)}
        onClose={() => setDeletingGoal(null)}
        goal={deletingGoal}
        onSuccess={handleDeleteSuccess}
      />

      {/* Modal de Fechamento */}
      <CloseWeekModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        week={week}
        onSuccess={handleCloseWeekSuccess}
      />
    </div>
  );
}
