'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { categoriesService } from '../../services/categories.service';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Category } from '../../types/category';

interface ArchiveCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category | null;
  onSuccess: (archivedCategory: Category) => void;
}

export function ArchiveCategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: ArchiveCategoryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!category) return null;

  async function handleArchive() {
    if (!category) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const archived = await categoriesService.archive(category.id);
      onSuccess(archived);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao arquivar a categoria.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Arquivar Categoria"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {error && <Alert variant="error" message={error} />}

        <p className="text-sm text-slate-600 dark:text-slate-300">
          Deseja arquivar a categoria <strong className="text-slate-900 dark:text-slate-100 font-semibold">{category.name}</strong>?
        </p>

        <p className="text-xs text-slate-500 bg-amber-50 p-3 rounded-lg border border-amber-200 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-200">
          Ao arquivar, a categoria não estará disponível para inclusão de novas metas, mas todos os ciclos e relatórios passados permanecerão preservados integralmente. Você poderá reativá-la posteriormente.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" label="Arquivando..." className="text-white" />
            ) : (
              'Confirmar Arquivamento'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
