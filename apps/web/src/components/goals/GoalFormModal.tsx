'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { goalsService } from '../../services/goals.service';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Category } from '../../types/category';
import type {
  Goal,
  GoalPriority,
  GoalType,
  CreateGoalInput,
  UpdateGoalInput,
} from '../../types/goal';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekId: string;
  goal?: Goal | null;
  categories: Category[];
  onSuccess: (savedGoal: Goal) => void;
}

interface GoalFormContentProps {
  weekId: string;
  goal?: Goal | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: (savedGoal: Goal) => void;
}

function GoalFormContent({
  weekId,
  goal,
  categories,
  onClose,
  onSuccess,
}: GoalFormContentProps) {
  const isEditing = Boolean(goal);

  const [categoryId, setCategoryId] = useState(
    goal?.categoryId || (categories.length > 0 ? categories[0].id : '')
  );
  const [title, setTitle] = useState(goal?.title || '');
  const [description, setDescription] = useState(goal?.description || '');
  const [type, setType] = useState<GoalType>(goal?.type || 'BINARY');
  const [priority, setPriority] = useState<GoalPriority>(goal?.priority || 'MEDIUM');
  const [targetValue, setTargetValue] = useState<string>(
    goal ? String(goal.targetValue) : '1'
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
      setError('Para metas quantitativas, a meta numérica deve ser maior que 0.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && goal) {
        const payload: UpdateGoalInput = {
          categoryId,
          title: title.trim(),
          description: description.trim() ? description.trim() : undefined,
          type,
          priority,
          targetValue: parsedTarget,
        };
        const updated = await goalsService.update(goal.id, payload);
        onSuccess(updated);
      } else {
        const payload: CreateGoalInput = {
          categoryId,
          title: title.trim(),
          description: description.trim() ? description.trim() : undefined,
          type,
          priority,
          targetValue: parsedTarget,
        };
        const created = await goalsService.create(weekId, payload);
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao salvar a meta.'));
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
          message="Nenhuma categoria ativa cadastrada. Cadastre uma categoria antes de criar metas."
        />
      )}

      <div>
        <label htmlFor="goal-category" className="block text-xs font-semibold text-slate-700">
          Categoria <span className="text-rose-500">*</span>
        </label>
        <select
          id="goal-category"
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
        <label htmlFor="goal-title" className="block text-xs font-semibold text-slate-700">
          Título da Meta <span className="text-rose-500">*</span>
        </label>
        <input
          id="goal-title"
          type="text"
          required
          maxLength={100}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Treinar musculação 4x na semana"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label htmlFor="goal-desc" className="block text-xs font-semibold text-slate-700">
          Critérios de Sucesso ou Descrição (opcional)
        </label>
        <textarea
          id="goal-desc"
          rows={2}
          maxLength={500}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex: Mínimo de 45 minutos por sessão"
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="goal-type" className="block text-xs font-semibold text-slate-700">
            Tipo de Meta <span className="text-rose-500">*</span>
          </label>
          <select
            id="goal-type"
            value={type}
            onChange={(e) => {
              const newType = e.target.value as GoalType;
              setType(newType);
              if (newType === 'BINARY') {
                setTargetValue('1');
              } else if (targetValue === '1' || !targetValue) {
                setTargetValue('5');
              }
            }}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="BINARY">Binária (Sim/Não)</option>
            <option value="QUANTITY">Quantitativa (Numérica)</option>
          </select>
          <p className="mt-1 text-xs text-slate-500">
            {type === 'BINARY'
              ? 'Conclusão sim/não (alvo fixado em 1).'
              : 'Progresso acumulado com meta numérica.'}
          </p>
        </div>

        <div>
          <label htmlFor="goal-priority" className="block text-xs font-semibold text-slate-700">
            Prioridade
          </label>
          <select
            id="goal-priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as GoalPriority)}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="LOW">Baixa</option>
            <option value="MEDIUM">Média</option>
            <option value="HIGH">Alta</option>
          </select>
        </div>
      </div>

      {type === 'QUANTITY' && (
        <div>
          <label htmlFor="goal-target" className="block text-xs font-semibold text-slate-700">
            Valor Alvo Numérico <span className="text-rose-500">*</span>
          </label>
          <input
            id="goal-target"
            type="number"
            min="0.1"
            step="any"
            required
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Ex: 5"
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Meta a atingir na semana (ex.: 5 treinos, 10 páginas, 20 km).
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting || categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting && <LoadingSpinner size="sm" />}
          {isEditing ? 'Salvar Alterações' : 'Criar Meta'}
        </button>
      </div>
    </form>
  );
}

export function GoalFormModal({
  isOpen,
  onClose,
  weekId,
  goal,
  categories,
  onSuccess,
}: GoalFormModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal ? 'Editar Meta' : 'Nova Meta Semanal'}
      description={
        goal
          ? 'Atualize os dados e critérios da meta.'
          : 'Defina uma meta para acompanhar durante este ciclo semanal.'
      }
      maxWidth="md"
    >
      <GoalFormContent
        key={goal ? goal.id : 'new-goal'}
        weekId={weekId}
        goal={goal}
        categories={categories}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
