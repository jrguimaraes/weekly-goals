'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { weeksService } from '../../services/weeks.service';
import { getApiErrorMessage } from '../../lib/api-client';
import { calculateEndDate, formatDate, getSuggestedStartDate } from '../../lib/date-utils';
import type { Week } from '../../types/week';

interface CreateWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (createdWeek: Week) => void;
}

function CreateWeekFormContent({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (createdWeek: Week) => void;
}) {
  const [startDate, setStartDate] = useState(getSuggestedStartDate());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculatedEndDate = calculateEndDate(startDate);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate) {
      setError('A data de início é obrigatória.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await weeksService.create({ startDate });
      onSuccess(created);
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao cadastrar a semana.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      <div>
        <label htmlFor="week-start-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Data de Início da Semana <span className="text-rose-500">*</span>
        </label>
        <input
          id="week-start-date"
          type="date"
          required
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Recomenda-se iniciar na segunda-feira para manter consistência operacional.
        </p>
      </div>

      {calculatedEndDate && (
        <div className="rounded-lg bg-indigo-50/70 p-4 border border-indigo-100 text-xs text-indigo-900 dark:bg-indigo-950/40 dark:border-indigo-900/60 dark:text-indigo-200 space-y-1">
          <div className="font-semibold text-indigo-950 dark:text-indigo-100">Intervalo do Ciclo Semanal (7 dias):</div>
          <div className="text-sm font-medium">
            {formatDate(startDate)} &rarr; {formatDate(calculatedEndDate)}
          </div>
          <div className="text-xs text-indigo-700 dark:text-indigo-300 pt-1">
            Data final calculada automaticamente (início + 6 dias). Não são permitidas semanas sobrepostas.
          </div>
        </div>
      )}

      <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-200 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-400">
        A semana será cadastrada no estado <strong>DRAFT (Em Planejamento)</strong>. Você poderá cadastrar metas antes de ativá-la para execução.
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || !startDate}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" label="Criando..." className="text-white" />
          ) : (
            'Criar Semana'
          )}
        </button>
      </div>
    </form>
  );
}

export function CreateWeekModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWeekModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Novo Ciclo Semanal"
      description="Cadastre um novo período de 7 dias para planejar metas."
    >
      <CreateWeekFormContent
        key={isOpen ? 'open' : 'closed'}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
