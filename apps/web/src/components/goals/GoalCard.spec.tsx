import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GoalCard } from './GoalCard';
import type { Goal } from '../../types/goal';

describe('GoalCard', () => {
  const binaryGoal: Goal = {
    id: 'g-bin-1',
    weekId: 'w-1',
    categoryId: 'c-1',
    title: 'Leitura de artigo técnico',
    description: 'Mínimo de 30 minutos',
    type: 'BINARY',
    priority: 'HIGH',
    targetValue: 1,
    currentValue: 1,
    status: 'COMPLETED',
    completedAt: '2026-09-08T10:00:00Z',
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-08T10:00:00Z',
    category: {
      id: 'c-1',
      name: 'Estudos',
      description: null,
      position: 0,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  };

  const quantityGoal: Goal = {
    id: 'g-qty-1',
    weekId: 'w-1',
    categoryId: 'c-2',
    title: 'Treinos de corrida',
    description: null,
    type: 'QUANTITY',
    priority: 'MEDIUM',
    targetValue: 4,
    currentValue: 2,
    status: 'IN_PROGRESS',
    completedAt: null,
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-08T10:00:00Z',
    category: {
      id: 'c-2',
      name: 'Saúde',
      description: null,
      position: 1,
      isActive: true,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  };

  it('deve renderizar meta binária com informações e status de concluída', () => {
    const html = renderToString(
      <GoalCard
        goal={binaryGoal}
        isWeekClosed={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain('Leitura de artigo técnico');
    expect(html).toContain('Mínimo de 30 minutos');
    expect(html).toContain('Estudos');
    expect(html).toContain('bg-indigo-50');
    expect(html).toContain('Alta');
    expect(html).toContain('Realizada');
    expect(html).toContain('Editar');
    expect(html).toContain('Excluir');
  });

  it('deve renderizar meta quantitativa com progresso e alvo', () => {
    const html = renderToString(
      <GoalCard
        goal={quantityGoal}
        isWeekClosed={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain('Treinos de corrida');
    expect(html).toContain('Saúde');
    expect(html).toContain('bg-indigo-50');
    expect(html).toContain('Média');
    expect(html).toContain('Progresso:');
    expect(html).toContain('2');
    expect(html).toContain('4');
    expect(html).toContain('50%');
    expect(html).toContain('Editar');
    expect(html).toContain('Excluir');
  });

  it('deve bloquear edição e exclusão quando a semana estiver fechada', () => {
    const html = renderToString(
      <GoalCard
        goal={binaryGoal}
        isWeekClosed={true}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain('Semana fechada (somente leitura)');
    expect(html).not.toContain('Editar</button>');
    expect(html).not.toContain('Excluir</button>');
  });

  it('deve renderizar controle de acompanhamento quando onProgressChange for fornecido', () => {
    const html = renderToString(
      <GoalCard
        goal={binaryGoal}
        isWeekClosed={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onProgressChange={vi.fn()}
      />
    );

    expect(html).toContain('Acompanhamento:');
    expect(html).toContain('Concluída');
  });

  it('deve dar destaque visual e exibir badge de superada para metas que ultrapassaram o esperado', () => {
    const exceededGoal: Goal = {
      ...quantityGoal,
      currentValue: 6,
      targetValue: 4,
      status: 'COMPLETED',
    };

    const html = renderToString(
      <GoalCard
        goal={exceededGoal}
        isWeekClosed={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />
    );

    expect(html).toContain('Superada');
    expect(html).toContain('+2');
    expect(html).toContain('150%');
    expect(html).toContain('border-emerald-300');
  });

  it('deve exibir a indicação de data relativa de atualização', () => {
    const todayGoal: Goal = {
      ...binaryGoal,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    const html = renderToString(
      <GoalCard
        goal={todayGoal}
        isWeekClosed={false}
      />
    );

    expect(html).toContain('atualizado hoje');
  });

  it('deve exibir "sem atualizações" quando a meta nunca foi modificada desde a criação', () => {
    const untouchedGoal: Goal = {
      ...binaryGoal,
      createdAt: '2026-09-05T10:00:00Z',
      updatedAt: '2026-09-05T10:00:00Z',
    };

    const html = renderToString(
      <GoalCard
        goal={untouchedGoal}
        isWeekClosed={false}
      />
    );

    expect(html).toContain('sem atualizações');
  });
});
