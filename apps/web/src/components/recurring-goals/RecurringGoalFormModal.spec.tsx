import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { RecurringGoalFormModal } from './RecurringGoalFormModal';
import type { RecurringGoal } from '../../types/recurring-goal';
import type { Category } from '../../types/category';

describe('RecurringGoalFormModal', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Estudos',
      description: null,
      position: 0,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  const mockRecurringGoal: RecurringGoal = {
    id: 'rec-1',
    categoryId: 'cat-1',
    title: 'Estudar Anki',
    description: '30 cards diários',
    type: 'QUANTITY',
    priority: 'HIGH',
    targetValue: 5,
    active: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
    category: mockCategories[0],
  };

  it('não deve renderizar quando isOpen for false', () => {
    const html = renderToString(
      <RecurringGoalFormModal
        isOpen={false}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    expect(html).toBe('');
  });

  it('deve renderizar modal de criação quando recurringGoal não for fornecido', () => {
    const html = renderToString(
      <RecurringGoalFormModal
        isOpen={true}
        onClose={vi.fn()}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Nova Meta Recorrente');
    expect(html).toContain('Criar Meta Recorrente');
    expect(html).toContain('Estudos');
    expect(html).toContain('Valor Alvo Semanal');
  });

  it('deve renderizar modal de edição com dados pré-preenchidos', () => {
    const html = renderToString(
      <RecurringGoalFormModal
        isOpen={true}
        onClose={vi.fn()}
        recurringGoal={mockRecurringGoal}
        categories={mockCategories}
        onSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Editar Meta Recorrente');
    expect(html).toContain('Salvar Alterações');
    expect(html).toContain('Estudar Anki');
    expect(html).toContain('30 cards diários');
    expect(html).toContain('disabled=""');
  });
});
