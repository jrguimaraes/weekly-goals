import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GoalList } from './GoalList';
import type { Goal } from '../../types/goal';
import type { Category } from '../../types/category';

describe('GoalList', () => {
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
    {
      id: 'c-2',
      name: 'Saúde',
      description: null,
      position: 1,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  const mockGoals: Goal[] = [
    {
      id: 'g-1',
      weekId: 'w-1',
      categoryId: 'c-1',
      title: 'Meta de Estudo',
      description: null,
      type: 'BINARY',
      priority: 'MEDIUM',
      targetValue: 1,
      currentValue: 0,
      status: 'PENDING',
      completedAt: null,
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-07T00:00:00Z',
      category: mockCategories[0],
    },
    {
      id: 'g-2',
      weekId: 'w-1',
      categoryId: 'c-2',
      title: 'Meta de Saúde',
      description: null,
      type: 'QUANTITY',
      priority: 'HIGH',
      targetValue: 3,
      currentValue: 3,
      status: 'COMPLETED',
      completedAt: '2026-09-08T00:00:00Z',
      createdAt: '2026-09-07T00:00:00Z',
      updatedAt: '2026-09-08T00:00:00Z',
      category: mockCategories[1],
    },
  ];

  it('deve renderizar lista de metas com total correto e filtros', () => {
    const html = renderToString(
      <GoalList
        goals={mockGoals}
        categories={mockCategories}
        selectedCategoryId="all"
        selectedStatus="all"
        onCategoryChange={vi.fn()}
        onStatusChange={vi.fn()}
        isWeekClosed={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAddNew={vi.fn()}
      />
    );

    expect(html).toContain('2 metas encontradas');
    expect(html).toContain('Meta de Estudo');
    expect(html).toContain('Meta de Saúde');
    expect(html).toContain('Todas as categorias');
    expect(html).toContain('Todos os status');
  });

  it('deve renderizar empty state com botão para adicionar meta quando não houver metas e semana aberta', () => {
    const html = renderToString(
      <GoalList
        goals={[]}
        categories={mockCategories}
        selectedCategoryId="all"
        selectedStatus="all"
        onCategoryChange={vi.fn()}
        onStatusChange={vi.fn()}
        isWeekClosed={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAddNew={vi.fn()}
      />
    );

    expect(html).toContain('Nenhuma meta cadastrada');
    expect(html).toContain('Adicionar Primeira Meta');
  });

  it('deve renderizar empty state para semana fechada sem permitir adicionar meta', () => {
    const html = renderToString(
      <GoalList
        goals={[]}
        categories={mockCategories}
        selectedCategoryId="all"
        selectedStatus="all"
        onCategoryChange={vi.fn()}
        onStatusChange={vi.fn()}
        isWeekClosed={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onAddNew={vi.fn()}
      />
    );

    expect(html).toContain('Esta semana foi encerrada sem metas registradas.');
    expect(html).not.toContain('Adicionar Primeira Meta');
  });
});
