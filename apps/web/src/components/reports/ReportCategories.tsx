import React from 'react';
import type { CategoryMetricsResult } from '../../types/week';

interface ReportCategoriesProps {
  categories: CategoryMetricsResult[];
}

export function ReportCategories({ categories }: ReportCategoriesProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500">
        Nenhuma categoria associada a este ciclo semanal.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">Desempenho por Categoria</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Indicadores consolidados por área no momento do fechamento.
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {categories.map((cat) => (
          <div key={cat.categoryId} className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-900">{cat.categoryName}</h4>
              <p className="text-xs text-slate-500">
                {`${cat.completedGoals} de ${cat.totalGoals} ${
                  cat.totalGoals === 1 ? 'meta concluída' : 'metas concluídas'
                }`}
              </p>
            </div>

            <div className="flex items-center gap-6 sm:w-1/2">
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <span>Taxa de Progresso</span>
                  <span className="font-bold text-indigo-700">{`${cat.progressRate}%`}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full bg-indigo-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(0, cat.progressRate))}%` }}
                  />
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="block text-xs text-slate-500">Conclusão</span>
                <span className="text-sm font-bold text-slate-900">{`${cat.completionRate}%`}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
