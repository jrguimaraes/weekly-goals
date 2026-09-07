import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GoalFormModal } from './GoalFormModal';
import { DeleteGoalModal } from './DeleteGoalModal';
import type { Goal } from '../../types/goal';
import type { Category } from '../../types/category';

describe('GoalModals', () => {
  const mockCategories: Category[] = [
    {
      id: 'c-1',
      name: 'Estudos',
      description: null,
      position: 0,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  const mockGoal: Goal = {
    id: 'g-1',
    weekId: 'w-1',
    categoryId: 'c-1',
    title: 'Estudar TypeScript',
    description: 'Capítulos 4 e 5',
    type: 'BINARY',
    priority: 'HIGH',
    targetValue: 1,
    currentValue: 0,
    status: 'PENDING',
    completedAt: null,
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:00Z',
    category: mockCategories[0],
  };

  describe('GoalFormModal', () => {
    it('não deve renderizar quando isOpen for false', () => {
      const html = renderToString(
        <GoalFormModal
          isOpen={false}
          onClose={vi.fn()}
          weekId="w-1"
          categories={mockCategories}
          onSuccess={vi.fn()}
        />
      );

      expect(html).toBe('');
    });

    it('deve renderizar modal de criação quando goal não for fornecido', () => {
      const html = renderToString(
        <GoalFormModal
          isOpen={true}
          onClose={vi.fn()}
          weekId="w-1"
          categories={mockCategories}
          onSuccess={vi.fn()}
        />
      );

      expect(html).toContain('Nova Meta Semanal');
      expect(html).toContain('Criar Meta');
      expect(html).toContain('Estudos');
    });

    it('deve renderizar modal de edição com dados pré-preenchidos', () => {
      const html = renderToString(
        <GoalFormModal
          isOpen={true}
          onClose={vi.fn()}
          weekId="w-1"
          goal={mockGoal}
          categories={mockCategories}
          onSuccess={vi.fn()}
        />
      );

      expect(html).toContain('Editar Meta');
      expect(html).toContain('Salvar Alterações');
      expect(html).toContain('Estudar TypeScript');
      expect(html).toContain('O tipo da meta não pode ser alterado após a criação.');
      expect(html).toContain('disabled=""');
    });
  });

  describe('DeleteGoalModal', () => {
    it('não deve renderizar quando goal for null', () => {
      const html = renderToString(
        <DeleteGoalModal
          isOpen={true}
          onClose={vi.fn()}
          goal={null}
          onSuccess={vi.fn()}
        />
      );

      expect(html).toBe('');
    });

    it('deve renderizar confirmação de exclusão com alerta de irreversibilidade', () => {
      const html = renderToString(
        <DeleteGoalModal
          isOpen={true}
          onClose={vi.fn()}
          goal={mockGoal}
          onSuccess={vi.fn()}
        />
      );

      expect(html).toContain('Excluir Meta');
      expect(html).toContain('Estudar TypeScript');
      expect(html).toContain('Esta ação é irreversível');
      expect(html).toContain('Confirmar Exclusão');
    });
  });
});
