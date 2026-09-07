'use client';

import React from 'react';
import { GoalCard } from './GoalCard';
import type { Goal } from '../../types/goal';
import type { Category } from '../../types/category';

interface GoalListProps {
  goals: Goal[];
  categories: Category[];
  selectedCategoryId: string;
  selectedStatus: string;
  onCategoryChange: (categoryId: string) => void;
  onStatusChange: (status: string) => void;
  isWeekClosed: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onAddNew: () => void;
}

export function GoalList({
  goals,
  categories,
  selectedCategoryId,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
  isWeekClosed,
  onEdit,
  onDelete,
  onAddNew,
}: GoalListProps) {
  const hasActiveFilters = selectedCategoryId !== 'all' || selectedStatus !== 'all';

  function handleResetFilters() {
    onCategoryChange('all');
    onStatusChange('all');
  }

  return (
    <div className="space-y-6">
      {/* Barra de Filtros */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label htmlFor="filter-category" className="sr-only">
              Filtrar por Categoria
            </label>
            <select
              id="filter-category"
              value={selectedCategoryId}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filter-status" className="sr-only">
              Filtrar por Status
            </label>
            <select
              id="filter-status"
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">Todos os status</option>
              <option value="PENDING">Pendentes</option>
              <option value="IN_PROGRESS">Em Progresso</option>
              <option value="COMPLETED">Concluídas</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Limpar filtros
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {`${goals.length} ${goals.length === 1 ? 'meta encontrada' : 'metas encontradas'}`}
        </div>
      </div>

      {/* Lista de Metas */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-slate-800">
            {hasActiveFilters ? 'Nenhuma meta encontrada' : 'Nenhuma meta cadastrada'}
          </h3>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            {hasActiveFilters
              ? 'Tente ajustar os filtros de categoria ou status para visualizar outras metas.'
              : isWeekClosed
              ? 'Esta semana foi encerrada sem metas registradas.'
              : 'Defina suas metas para esta semana para começar a acompanhar o seu progresso.'}
          </p>
          {!hasActiveFilters && !isWeekClosed && (
            <button
              type="button"
              onClick={onAddNew}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
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
              Adicionar Primeira Meta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              isWeekClosed={isWeekClosed}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
