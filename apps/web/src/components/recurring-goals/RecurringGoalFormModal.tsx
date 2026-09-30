'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { recurringGoalsService } from '../../services/recurring-goals.service';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Category } from '../../types/category';
import type { GoalPriority, GoalType } from '../../types/goal';
import type {
  RecurringGoal,
  CreateRecurringGoalInput,
  UpdateRecurringGoalInput,
} from '../../types/recurring-goal';

interface RecurringGoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  recurringGoal?: RecurringGoal | null;
  categories: Category[];
  onSuccess: (saved: RecurringGoal) => void;
}

interface FormContentProps {
  recurringGoal?: RecurringGoal | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: (saved: RecurringGoal) => void;
}

function RecurringGoalFormContent({
  recurringGoal,
  categories,
  onClose,
  onSuccess,
}: FormContentProps) {
  const isEditing = Boolean(recurringGoal);

  const [categoryId, setCategoryId] = useState(
    recurringGoal?.categoryId || (categories.length > 0 ? categories[0].id : '')
  );
  const [title, setTitle] = useState(recurringGoal?.title || '');
  const [description, setDescription] = useState(recurringGoal?.description || '');
  const [type, setType] = useState<GoalType>(recurringGoal?.type || 'QUANTITY');
  const [priority, setPriority] = useState<GoalPriority>(recurringGoal?.priority || 'MEDIUM');
  const [targetValue, setTargetValue] = useState<string>(
    recurringGoal ? String(recurringGoal.targetValue) : '5'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError('O título da meta é obrigatório.');
      return;
    }

    if (!categoryId) {
      setError('Selecione uma categoria ativa para a meta.');
      return;
    }

    const parsedTarget = type === 'BINARY' ? 1 : Number(targetValue);
    if (type === 'QUANTITY' && (!targetValue || isNaN(parsedTarget) || parsedTarget <= 0)) {
      setError('Para metas quantitativas, o valor alvo deve ser maior que 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && recurringGoal) {
        const payload: UpdateRecurringGoalInput = {
          categoryId,
          title: title.trim(),
          description: description.trim() ? description.trim() : null,
          priority,
          targetValue: parsedTarget,
        };
        const updated = await recurringGoalsService.update(recurringGoal.id, payload);
        onSuccess(updated);
      } else {
        const payload: CreateRecurringGoalInput = {
          categoryId,
          title: title.trim(),
          description: description.trim() ? description.trim() : undefined,
          type,
          priority,
          targetValue: parsedTarget,
          active: true,
        };
        const created = await recurringGoalsService.create(payload);
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao salvar meta recorrente.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      {categories.length === 0 && (
        <Alert
          variant="warning"
          message="Nenhuma categoria ativa cadastrada. Cadastre uma categoria antes de configurar metas recorrentes."
        />
      )}

      <div>
        <label htmlFor="rec-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Categoria <span className="text-rose-500">*</span>
        </label>
        <select
          id="rec-category"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="" disabled>
            Selecione uma categoria
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="rec-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Título da Meta <span className="text-rose-500">*</span>
        </label>
        <input
          id="rec-title"
          type="text"
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Treinar musculação"
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      <div>
        <label htmlFor="rec-description" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Critérios de Sucesso / Descrição (opcional)
        </label>
        <textarea
          id="rec-description"
          rows={2}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Mínimo de 45 minutos por sessão"
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="rec-type" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tipo de Meta
          </label>
          <select
            id="rec-type"
            disabled={isEditing}
            value={type}
            onChange={(e) => {
              const newType = e.target.value as GoalType;
              setType(newType);
              if (newType === 'BINARY') {
                setTargetValue('1');
              } else if (targetValue === '1') {
                setTargetValue('5');
              }
            }}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 disabled:opacity-60"
          >
            <option value="QUANTITY">Quantitativa (numérica)</option>
            <option value="BINARY">Binária (sim / não)</option>
          </select>
        </div>

        <div>
          <label htmlFor="rec-priority" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Prioridade
          </label>
          <select
            id="rec-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as GoalPriority)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </select>
        </div>
      </div>

      {type === 'QUANTITY' && (
        <div>
          <label htmlFor="rec-target" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Valor Alvo Semanal <span className="text-rose-500">*</span>
          </label>
          <input
            id="rec-target"
            type="number"
            min="0.1"
            step="any"
            required
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Ex: 5"
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Valor padrão que será aplicado a cada semana gerada (ex.: 5x, 10 páginas, 20 km).
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isEditing ? 'Salvar Alterações' : 'Criar Meta Recorrente'}
        </button>
      </div>
    </form>
  );
}

export function RecurringGoalFormModal({
  isOpen,
  onClose,
  recurringGoal,
  categories,
  onSuccess,
}: RecurringGoalFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recurringGoal ? 'Editar Meta Recorrente' : 'Nova Meta Recorrente'}
      maxWidth="lg"
    >
      {isOpen && (
        <RecurringGoalFormContent
          recurringGoal={recurringGoal}
          categories={categories}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      )}
    </Modal>
  );
}
