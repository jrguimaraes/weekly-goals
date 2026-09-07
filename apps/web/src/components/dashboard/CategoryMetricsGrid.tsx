import React from 'react';
import type { CategoryMetricsResult } from '../../types/week';

interface CategoryMetricsGridProps {
  categories: CategoryMetricsResult[];
}

export function CategoryMetricsGrid({ categories }: CategoryMetricsGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Nenhuma categoria com metas vinculadas nesta semana.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((cat) => (
        <div
          key={cat.categoryId}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-900">{cat.categoryName}</h4>
              <p className="mt-0.5 text-xs text-slate-500">
                {`${cat.completedGoals} de ${cat.totalGoals} ${
                  cat.totalGoals === 1 ? 'meta concluída' : 'metas concluídas'
                }`}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
              {`${cat.completionRate}%`}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Progresso acumulado</span>
              <span className="font-semibold text-indigo-700">{`${cat.progressRate}%`}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, cat.progressRate))}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
