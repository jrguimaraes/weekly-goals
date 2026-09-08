'use client';

import React from 'react';
import { Badge } from '../ui/Badge';
import type { Category } from '../../types/category';

interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onArchive: (category: Category) => void;
  onReactivate: (category: Category) => void;
}

export function CategoryList({
  categories,
  onEdit,
  onArchive,
  onReactivate,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100">Nenhuma categoria encontrada</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Nenhuma categoria cadastrada com o filtro selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold text-slate-600 uppercase tracking-wider dark:bg-slate-800/80 dark:text-slate-300">
            <tr>
              <th scope="col" className="px-4 py-3 sm:px-6 w-16 text-center">
                Pos
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6">
                Nome & Descrição
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6 w-28 text-center">
                Status
              </th>
              <th scope="col" className="px-4 py-3 sm:px-6 w-44 text-right">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white dark:divide-slate-800 dark:bg-slate-900">
            {categories.map((category) => (
              <tr
                key={category.id}
                className="hover:bg-slate-50/75 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-4 sm:px-6 text-center">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-mono font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {category.position}
                  </span>
                </td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {category.name}
                    </span>
                    {category.description ? (
                      <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {category.description}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">
                        Sem descrição informada
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 sm:px-6 text-center">
                  {category.isActive ? (
                    <Badge variant="success" size="sm">
                      Ativa
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      Arquivada
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-4 sm:px-6 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(category)}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-colors"
                    >
                      Editar
                    </button>
                    {category.isActive ? (
                      <button
                        type="button"
                        onClick={() => onArchive(category)}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50 transition-colors"
                      >
                        Arquivar
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onReactivate(category)}
                        className="rounded-md px-2.5 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50 transition-colors"
                      >
                        Reativar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
