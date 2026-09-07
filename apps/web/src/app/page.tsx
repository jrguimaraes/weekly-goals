'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { weeksService } from '../services/weeks.service';
import { goalsService } from '../services/goals.service';
import { WeekStatusBadge } from '../components/weeks/WeekStatusBadge';
import { MetricsCard } from '../components/dashboard/MetricsCard';
import { CategoryMetricsGrid } from '../components/dashboard/CategoryMetricsGrid';
import { GoalCard } from '../components/goals/GoalCard';
import { CloseWeekModal } from '../components/weeks/CloseWeekModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { getApiErrorMessage } from '../lib/api-client';
import { formatDateRange } from '../lib/date-utils';
import type { Week, WeekSummary } from '../types/week';
import type { Goal } from '../types/goal';

export default function HomePage() {
  const [currentWeek, setCurrentWeek] = useState<Week | null>(null);
  const [summary, setSummary] = useState<WeekSummary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [allWeeks, setAllWeeks] = useState<Week[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Busca se há semana ativa
      const activeWeeks = await weeksService.list('ACTIVE');
      const all = await weeksService.list();
      setAllWeeks(all);

      const targetWeek = activeWeeks.length > 0 ? activeWeeks[0] : null;
      setCurrentWeek(targetWeek);

      if (targetWeek) {
        const [summaryData, goalsData] = await Promise.all([
          weeksService.getSummary(targetWeek.id),
          goalsService.listByWeek(targetWeek.id),
        ]);
        setSummary(summaryData);
        setGoals(goalsData);
      } else {
        setSummary(null);
        setGoals([]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao carregar os dados do dashboard.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const activeWeeks = await weeksService.list('ACTIVE');
        const all = await weeksService.list();
        if (!isMounted) return;
        setAllWeeks(all);

        const targetWeek = activeWeeks.length > 0 ? activeWeeks[0] : null;
        setCurrentWeek(targetWeek);

        if (targetWeek) {
          const [summaryData, goalsData] = await Promise.all([
            weeksService.getSummary(targetWeek.id),
            goalsService.listByWeek(targetWeek.id),
          ]);
          if (!isMounted) return;
          setSummary(summaryData);
          setGoals(goalsData);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Falha ao carregar os dados do dashboard.'));
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

  async function handleProgressChange(goalId: string, newValue: number) {
    if (!currentWeek) return;
    try {
      const updatedGoal = await goalsService.updateProgress(goalId, newValue);
      setGoals((prev) => prev.map((g) => (g.id === goalId ? updatedGoal : g)));

      // Recarrega o summary do backend para manter sincronia exata dos rates
      const updatedSummary = await weeksService.getSummary(currentWeek.id);
      setSummary(updatedSummary);
      setFeedback('Progresso atualizado com sucesso!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao atualizar o progresso da meta.'));
      throw err;
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium">
          Carregando visão operacional da semana...
        </p>
      </div>
    );
  }

  // Caso não haja semana ativa
  if (!currentWeek || !summary) {
    const draftWeek = allWeeks.find((w) => w.status === 'DRAFT');
    const closedWeeks = allWeeks.filter((w) => w.status === 'CLOSED');

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Painel Semanal
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Acompanhe a execução, taxas de progresso e metas do ciclo em andamento.
          </p>
        </div>

        {error && <Alert variant="error" message={error} />}

        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-8 sm:p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            Nenhuma semana ativa no momento
          </h3>

          {draftWeek ? (
            <div className="mt-2 space-y-4">
              <p className="max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                Você possui a semana{' '}
                <strong className="text-slate-800 font-semibold">
                  {formatDateRange(draftWeek.startDate, draftWeek.endDate)}
                </strong>{' '}
                em fase de planejamento. Ative-a para acompanhar o progresso das suas metas no
                painel principal.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href={`/weeks/${draftWeek.id}`}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  Ver Metas Planejadas
                </Link>
                <Link
                  href="/weeks"
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                >
                  Ir para Planejamento &amp; Ativar
                </Link>
              </div>
            </div>
          ) : closedWeeks.length > 0 ? (
            <div className="mt-2 space-y-4">
              <p className="max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                O último ciclo semanal foi encerrado. Crie uma nova semana em planejamento para
                organizar suas próximas metas.
              </p>
              <div className="pt-2">
                <Link
                  href="/weeks"
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Criar Novo Ciclo Semanal
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-2 space-y-4">
              <p className="max-w-md mx-auto text-xs text-slate-500 leading-relaxed">
                Cadastre suas primeiras categorias e planeje uma nova semana de metas para
                começar a acompanhar sua produtividade.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Link
                  href="/categories"
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
                >
                  Cadastrar Categorias
                </Link>
                <Link
                  href="/weeks"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  Criar Primeira Semana
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const inProgressGoalsCount = goals.filter((g) => g.status === 'IN_PROGRESS').length;
  const pendingGoalsCount = goals.filter((g) => g.status === 'PENDING').length;

  return (
    <div className="space-y-8">
      {/* Cabeçalho da Semana Ativa */}
      <div className="rounded-2xl border border-emerald-200 bg-linear-to-r from-emerald-50/70 via-white to-indigo-50/40 p-6 shadow-xs">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-300/60">
                Ciclo Atual
              </span>
              <WeekStatusBadge status={currentWeek.status} size="sm" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {formatDateRange(currentWeek.startDate, currentWeek.endDate)}
            </h1>
            <p className="text-xs text-slate-500">
              Métricas e acompanhamento ágil de metas da semana em andamento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5 text-slate-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
              Atualizar
            </button>
            <Link
              href={`/weeks/${currentWeek.id}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              Gerenciar Metas
            </Link>
            <button
              type="button"
              onClick={() => setIsCloseModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-rose-600 shadow-xs hover:bg-rose-50 transition-colors"
            >
              Encerrar Semana
            </button>
          </div>
        </div>
      </div>

      {feedback && (
        <Alert variant="success" message={feedback} onDismiss={() => setFeedback(null)} />
      )}
      {error && <Alert variant="error" message={error} />}

      {/* Grid de Métricas Principais (Summary) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Indicadores da Semana</h2>
          <span className="text-xs text-slate-500">Calculado pelo backend</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Taxa de Conclusão"
            value={`${summary.completionRate}%`}
            description={`${summary.completedGoals} de ${summary.totalGoals} metas totalmente concluídas`}
            percentage={summary.completionRate}
            variant="emerald"
          />

          <MetricsCard
            title="Taxa de Progresso"
            value={`${summary.progressRate}%`}
            description="Avanço ponderado considerando progresso acumulado"
            percentage={summary.progressRate}
            variant="indigo"
          />

          <MetricsCard
            title="Em Andamento"
            value={inProgressGoalsCount}
            description="Metas com progresso parcial registrado"
            percentage={
              summary.totalGoals > 0
                ? Math.round((inProgressGoalsCount / summary.totalGoals) * 100)
                : 0
            }
            variant="amber"
          />

          <MetricsCard
            title="Pendentes"
            value={pendingGoalsCount}
            description="Metas sem progresso registrado no ciclo"
            percentage={
              summary.totalGoals > 0
                ? Math.round((pendingGoalsCount / summary.totalGoals) * 100)
                : 0
            }
            variant="slate"
          />
        </div>
      </section>

      {/* Métricas por Categoria */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Progresso por Categoria</h2>
          <span className="text-xs text-slate-500 font-medium">
            {summary.categories.length}{' '}
            {summary.categories.length === 1 ? 'categoria ativa' : 'categorias ativas'}
          </span>
        </div>

        <CategoryMetricsGrid categories={summary.categories} />
      </section>

      {/* Metas da Semana com Controle Ágil */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Metas em Acompanhamento</h2>
            <p className="text-xs text-slate-500">
              Atualize o progresso diretamente no painel para recalcular os indicadores.
            </p>
          </div>
          <Link
            href={`/weeks/${currentWeek.id}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            + Adicionar / Editar Metas
          </Link>
        </div>

        {goals.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-sm font-semibold text-slate-800">
              Nenhuma meta cadastrada para esta semana ativa.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Adicione metas para começar a pontuar suas taxas de conclusão e progresso.
            </p>
            <Link
              href={`/weeks/${currentWeek.id}`}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              Cadastrar Metas Agora
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isWeekClosed={currentWeek.status === 'CLOSED'}
                onEdit={() => {}}
                onDelete={() => {}}
                onProgressChange={handleProgressChange}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal de Fechamento */}
      <CloseWeekModal
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
        week={currentWeek}
        onSuccess={() => {
          setIsCloseModalOpen(false);
          loadDashboard();
        }}
      />
    </div>
  );
}
