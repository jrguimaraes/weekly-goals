import React from 'react';
import type { CategoryMetricsResult } from '../../types/week';

interface ReportCategoriesProps {
  categories: CategoryMetricsResult[];
}

export function ReportCategories({ categories }: ReportCategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1.5 break-inside-avoid page-break-inside-avoid print:border-b print:border-slate-200 print:pb-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 print:text-slate-900 dark:text-slate-200">
          Desempenho por Categoria
        </h2>
        <span className="text-[11px] text-slate-600 print:hidden dark:text-slate-400">
          {categories.length} {categories.length === 1 ? 'área acompanhada' : 'áreas acompanhadas'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 print:grid-cols-2 print:gap-x-8 print:gap-y-3">
        {categories.map((cat) => {
          const progressWidth = Math.min(100, Math.max(0, cat.progressRate));
          const isComplete = cat.totalGoals > 0 && cat.completedGoals === cat.totalGoals;

          return (
            <div
              key={cat.categoryId}
              className={`rounded-lg border p-2.5 print:p-0 print:border-0 print:bg-transparent print:rounded-none break-inside-avoid page-break-inside-avoid bg-white dark:bg-slate-900 ${
                isComplete
                  ? 'border-emerald-300 dark:border-emerald-800/80'
                  : 'border-slate-300 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900 truncate dark:text-slate-100 print:text-xs print:font-bold">
                  {cat.categoryName}
                </h3>
                <span
                  className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded print:text-[10px] print:p-0 print:border-0 print:bg-transparent print:font-semibold ${
                    isComplete
                      ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 print:text-emerald-800'
                      : 'bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 print:text-slate-600'
                  }`}
                >
                  {`${cat.completedGoals} / ${cat.totalGoals} concluídas`}
                </span>
              </div>

              {/* Barra de progresso */}
              <div className="mt-2 space-y-1">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 print:bg-slate-200">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isComplete
                        ? 'bg-emerald-600 dark:bg-emerald-500 print:bg-emerald-600'
                        : 'bg-indigo-600 dark:bg-indigo-500 print:bg-indigo-700'
                    }`}
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-700 dark:text-slate-300 print:text-slate-600 print:text-[9.5px]">
                  <span>Progresso: <strong>{`${cat.progressRate}%`}</strong></span>
                  <span>Conclusão: <strong>{`${cat.completionRate}%`}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
