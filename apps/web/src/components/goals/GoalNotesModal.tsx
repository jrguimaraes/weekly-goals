'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { goalsService } from '../../services/goals.service';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Goal } from '../../types/goal';

interface GoalNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  onSuccess: (updatedGoal: Goal) => void;
}

interface GoalNotesContentProps {
  goal: Goal;
  onClose: () => void;
  onSuccess: (updatedGoal: Goal) => void;
}

function GoalNotesContent({
  goal,
  onClose,
  onSuccess,
}: GoalNotesContentProps) {
  const [notes, setNotes] = useState(goal.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setIsSubmitting(true);
    setError(null);

    try {
      const trimmedNotes = notes.trim();
      const updated = await goalsService.update(goal.id, {
        notes: trimmedNotes ? trimmedNotes : null,
      });
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao salvar as observações da meta.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      <div>
        <label
          htmlFor="goal-modal-notes"
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1"
        >
          Contexto livre / Motivos / Aprendizados
        </label>
        <textarea
          id="goal-modal-notes"
          rows={4}
          maxLength={1000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex.: Não consegui cumprir porque viajei a trabalho na quinta-feira / Consegui superar o esperado porque fiz 2 treinos extras no fim de semana."
          className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
        <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Essas anotações serão preservadas no relatório histórico da semana.</span>
          <span>{notes.length}/1000</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          Salvar Contexto
        </button>
      </div>
    </form>
  );
}

export function GoalNotesModal({
  isOpen,
  onClose,
  goal,
  onSuccess,
}: GoalNotesModalProps) {
  if (!goal) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Observações e Contexto"
      description={`Contextualize o andamento ou resultado de "${goal.title}".`}
      maxWidth="md"
    >
      <GoalNotesContent
        key={goal.id}
        goal={goal}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
