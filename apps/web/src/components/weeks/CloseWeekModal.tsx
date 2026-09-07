'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { weeksService } from '../../services/weeks.service';
import { getApiErrorMessage } from '../../lib/api-client';
import { formatDateRange } from '../../lib/date-utils';
import type { Week } from '../../types/week';

interface CloseWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  week: Week | null;
  onSuccess: (closedWeek: Week) => void;
}

export function CloseWeekModal({
  isOpen,
  onClose,
  week,
  onSuccess,
}: CloseWeekModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!week) return null;

  async function handleCloseWeek() {
    if (!week) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const closed = await weeksService.close(week.id);
      onSuccess(closed);
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Falha ao encerrar a semana. Verifique se o ciclo já não foi fechado.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Encerrar Ciclo Semanal"
      description="Conclusão definitiva da semana e congelamento de dados."
      maxWidth="md"
    >
      <div className="space-y-4">
        {error && <Alert variant="error" message={error} />}

        <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="font-semibold text-amber-900">Período a ser encerrado:</div>
          <div className="text-sm font-bold text-amber-900">
            {formatDateRange(week.startDate, week.endDate)}
          </div>
        </div>

        <div className="rounded-lg bg-rose-50 p-4 border border-rose-200 space-y-2 text-xs text-rose-800">
          <div className="font-bold text-rose-900 flex items-center gap-1.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 shrink-0 text-rose-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Operação definitiva e irreversível:
          </div>
          <ul className="list-disc pl-5 space-y-1 leading-relaxed">
            <li>
              Todas as metas e seus valores de progresso serão <strong>permanentemente congelados</strong>.
            </li>
            <li>
              Não será possível cadastrar, editar, reativar ou remover nenhuma meta nesta semana.
            </li>
            <li>
              Um <strong>snapshot imutável do relatório semanal</strong> será gerado e consolidado para consulta no histórico.
            </li>
          </ul>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Tem certeza de que revisou todos os seus avanços e deseja concluir este ciclo agora?
        </p>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCloseWeek}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting && <LoadingSpinner size="sm" />}
            Confirmar Fechamento da Semana
          </button>
        </div>
      </div>
    </Modal>
  );
}
