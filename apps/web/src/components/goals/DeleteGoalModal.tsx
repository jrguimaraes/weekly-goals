'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { goalsService } from '../../services/goals.service';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Goal } from '../../types/goal';

interface DeleteGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSuccess: (deletedGoal: Goal) => void;
}

export function DeleteGoalModal({
  isOpen,
  onClose,
  goal,
  onSuccess,
}: DeleteGoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  async function handleDelete() {
    if (!goal) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const deleted = await goalsService.delete(goal.id);
      onSuccess(deleted);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao remover a meta.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Excluir Meta"
      maxWidth="sm"
    >
      <div className="space-y-4">
        {error && <Alert variant="error" message={error} />}

        <p className="text-sm text-slate-600">
          Tem certeza de que deseja excluir a meta{' '}
          <strong className="text-slate-900 font-semibold">{goal.title}</strong>?
        </p>

        {goal.category && (
          <p className="text-xs text-slate-500">
            Categoria associada:{' '}
            <span className="font-medium text-slate-700">{goal.category.name}</span>
          </p>
        )}

        <p className="text-xs text-rose-700 bg-rose-50 p-3 rounded-lg border border-rose-200">
          Esta ação é irreversível. O registro da meta será permanentemente removido desta semana.
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </Modal>
  );
}
