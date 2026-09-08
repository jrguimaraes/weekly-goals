'use client';

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { categoriesService } from '../../services/categories.service';
import { getApiErrorMessage } from '../../lib/api-client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../types/category';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: (savedCategory: Category) => void;
}

interface CategoryFormContentProps {
  category?: Category | null;
  onClose: () => void;
  onSuccess: (savedCategory: Category) => void;
}

function CategoryFormContent({
  category,
  onClose,
  onSuccess,
}: CategoryFormContentProps) {
  const isEditing = Boolean(category);

  const [name, setName] = useState(category?.name || '');
  const [description, setDescription] = useState(category?.description || '');
  const [position, setPosition] = useState<number>(category?.position || 0);
  const [isActive, setIsActive] = useState<boolean>(category ? category.isActive : true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('O nome da categoria é obrigatório.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && category) {
        const payload: UpdateCategoryInput = {
          name: name.trim(),
          description: description.trim() ? description.trim() : undefined,
          position: Number(position) || 0,
          isActive,
        };
        const updated = await categoriesService.update(category.id, payload);
        onSuccess(updated);
      } else {
        const payload: CreateCategoryInput = {
          name: name.trim(),
          description: description.trim() ? description.trim() : undefined,
          position: Number(position) || 0,
        };
        const created = await categoriesService.create(payload);
        onSuccess(created);
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Falha ao salvar a categoria.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert variant="error" message={error} />}

      <div>
        <label htmlFor="cat-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Nome da Categoria <span className="text-rose-500">*</span>
        </label>
        <input
          id="cat-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Saúde, Estudos, Finanças"
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      <div>
        <label htmlFor="cat-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Descrição (opcional)
        </label>
        <textarea
          id="cat-desc"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Objetivo ou escopo desta categoria"
          className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
        />
      </div>

      <div>
        <label htmlFor="cat-pos" className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Posição na Listagem
        </label>
        <input
          id="cat-pos"
          type="number"
          min={0}
          value={position}
          onChange={(e) => setPosition(parseInt(e.target.value, 10) || 0)}
          className="mt-1 block w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Menores números são exibidos primeiro.</p>
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 pt-1">
          <input
            id="cat-active"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800"
          />
          <label htmlFor="cat-active" className="text-xs font-medium text-slate-700 dark:text-slate-300">
            Categoria Ativa (disponível para novas metas)
          </label>
        </div>
      )}

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
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <LoadingSpinner size="sm" label="Salvando..." className="text-white" />
          ) : isEditing ? (
            'Salvar Alterações'
          ) : (
            'Criar Categoria'
          )}
        </button>
      </div>
    </form>
  );
}

export function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryFormModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Editar Categoria' : 'Nova Categoria'}
      description={
        category
          ? 'Atualize os dados e a visibilidade da categoria.'
          : 'Cadastre uma nova área de foco para agrupar metas.'
      }
    >
      <CategoryFormContent
        key={category?.id || 'new-category'}
        category={category}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    </Modal>
  );
}
