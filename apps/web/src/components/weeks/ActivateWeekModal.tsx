'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { weeksService } from '../../services/weeks.service';
import { getApiErrorMessage } from '../../lib/api-client';
import { formatDateRange } from '../../lib/date-utils';
import type { Week } from '../../types/week';

interface ActivateWeekModalProps {
  isOpen: boolean;
  onClose: () => void;
  week: Week | null;
  onSuccess: (activatedWeek: Week) => void;
}

export function ActivateWeekModal({
  isOpen,
  onClose,
  week,
  onSuccess,
}: ActivateWeekModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!week) return null;

  async function handleActivate() {
    if (!week) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const activated = await weeksService.activate(week.id);
      onSuccess(activated);
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Falha ao ativar a semana. Verifique se já não existe outra semana ativa simultaneamente.'
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
      title="Ativar Ciclo Semanal"
      description="Transição de planejamento para execução ativa."
      maxWidth="sm"
    >
      <div className="space-y-4">
        {error && <Alert variant="error" message={error} />}

        <div className="rounded-lg bg-emerald-50/70 p-4 border border-emerald-100 text-xs text-emerald-950 space-y-1">
          <div className="font-semibold text-emerald-900">Período a ser ativado:</div>
          <div className="text-sm font-bold text-emerald-800">
            {formatDateRange(week.startDate, week.endDate)}
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Somente <strong>uma semana</strong> pode estar ativa simultaneamente no sistema. Ao ativar, você iniciará a contagem do ciclo e poderá registrar o progresso das metas.
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
            onClick={handleActivate}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <LoadingSpinner size="sm" label="Ativando..." className="text-white" />
            ) : (
              'Confirmar Ativação'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
