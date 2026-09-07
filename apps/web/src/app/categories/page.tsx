'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { categoriesService } from '../../services/categories.service';
import { CategoryList } from '../../components/categories/CategoryList';
import { CategoryFormModal } from '../../components/categories/CategoryFormModal';
import { ArchiveCategoryModal } from '../../components/categories/ArchiveCategoryModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Alert } from '../../components/ui/Alert';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Category } from '../../types/category';

type FilterOption = 'all' | 'active' | 'archived';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ message: string; variant: 'success' | 'info' } | null>(null);

  const [filter, setFilter] = useState<FilterOption>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [archivingCategory, setArchivingCategory] = useState<Category | null>(null);

  const loadCategories = useCallback(async (currentFilter: FilterOption) => {
    setIsLoading(true);
    setError(null);
    try {
      const isActiveParam =
        currentFilter === 'active' ? true : currentFilter === 'archived' ? false : undefined;
      const data = await categoriesService.list(isActiveParam);
      setCategories(data);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível carregar as categorias.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      try {
        const isActiveParam =
          filter === 'active' ? true : filter === 'archived' ? false : undefined;
        const data = await categoriesService.list(isActiveParam);
        if (isMounted) {
          setCategories(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(getApiErrorMessage(err, 'Não foi possível carregar as categorias.'));
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
  }, [filter]);

  function handleFilterChange(newFilter: FilterOption) {
    setFilter(newFilter);
  }

  function handleOpenCreate() {
    setEditingCategory(null);
    setIsFormOpen(true);
  }

  function handleOpenEdit(category: Category) {
    setEditingCategory(category);
    setIsFormOpen(true);
  }

  function handleOpenArchive(category: Category) {
    setArchivingCategory(category);
  }

  async function handleReactivate(category: Category) {
    try {
      const updated = await categoriesService.update(category.id, { isActive: true });
      setFeedback({
        message: `Categoria "${updated.name}" reativada com sucesso.`,
        variant: 'success',
      });
      loadCategories(filter);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao reativar categoria.'));
    }
  }

  function handleFormSuccess(savedCategory: Category) {
    const isEdit = Boolean(editingCategory);
    setFeedback({
      message: isEdit
        ? `Categoria "${savedCategory.name}" atualizada com sucesso.`
        : `Categoria "${savedCategory.name}" criada com sucesso.`,
      variant: 'success',
    });
    loadCategories(filter);
  }

  function handleArchiveSuccess(archivedCategory: Category) {
    setFeedback({
      message: `Categoria "${archivedCategory.name}" arquivada com sucesso.`,
      variant: 'info',
    });
    loadCategories(filter);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Categorias de Metas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Organize áreas de foco (Saúde, Estudos, Carreira, etc.) para vincular suas metas semanais.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <svg
            className="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nova Categoria
        </button>
      </div>

      {feedback && (
        <Alert
          variant={feedback.variant}
          message={feedback.message}
          onDismiss={() => setFeedback(null)}
        />
      )}

      {error && (
        <div className="space-y-3">
          <Alert variant="error" message={error} />
          <button
            type="button"
            onClick={() => loadCategories(filter)}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            Tentar novamente
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span className="text-xs font-medium text-slate-500 mr-2">Filtrar:</span>
        <button
          type="button"
          onClick={() => handleFilterChange('all')}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            filter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange('active')}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            filter === 'active'
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Ativas
        </button>
        <button
          type="button"
          onClick={() => handleFilterChange('archived')}
          className={`rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
            filter === 'archived'
              ? 'bg-slate-700 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Arquivadas
        </button>
      </div>

      {isLoading ? (
        <div className="py-16 text-center">
          <LoadingSpinner size="lg" label="Carregando categorias..." />
        </div>
      ) : (
        <CategoryList
          categories={categories}
          onEdit={handleOpenEdit}
          onArchive={handleOpenArchive}
          onReactivate={handleReactivate}
        />
      )}

      <CategoryFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        category={editingCategory}
        onSuccess={handleFormSuccess}
      />

      <ArchiveCategoryModal
        isOpen={Boolean(archivingCategory)}
        onClose={() => setArchivingCategory(null)}
        category={archivingCategory}
        onSuccess={handleArchiveSuccess}
      />
    </div>
  );
}
