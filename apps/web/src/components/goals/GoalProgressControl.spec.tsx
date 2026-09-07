import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GoalProgressControl } from './GoalProgressControl';
import type { Goal } from '../../types/goal';

describe('GoalProgressControl', () => {
  const binaryPending: Goal = {
    id: 'g-bin-p',
    weekId: 'w-1',
    categoryId: 'c-1',
    title: 'Meta Binária Pendente',
    description: null,
    type: 'BINARY',
    priority: 'MEDIUM',
    targetValue: 1,
    currentValue: 0,
    status: 'PENDING',
    completedAt: null,
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:00Z',
  };

  const binaryCompleted: Goal = {
    ...binaryPending,
    id: 'g-bin-c',
    currentValue: 1,
    status: 'COMPLETED',
  };

  const quantityGoal: Goal = {
    id: 'g-qty-1',
    weekId: 'w-1',
    categoryId: 'c-1',
    title: 'Meta Quantitativa',
    description: null,
    type: 'QUANTITY',
    priority: 'HIGH',
    targetValue: 5,
    currentValue: 2,
    status: 'IN_PROGRESS',
    completedAt: null,
    createdAt: '2026-09-07T00:00:00Z',
    updatedAt: '2026-09-07T00:00:00Z',
  };

  const quantityZero: Goal = {
    ...quantityGoal,
    id: 'g-qty-zero',
    currentValue: 0,
    status: 'PENDING',
  };

  describe('Metas BINARY', () => {
    it('deve renderizar botão para concluir quando pendente', () => {
      const html = renderToString(
        <GoalProgressControl
          goal={binaryPending}
          isWeekClosed={false}
          onProgressChange={vi.fn()}
        />
      );

      expect(html).toContain('Concluir');
      expect(html).toContain('aria-label="Marcar meta como concluída"');
      expect(html).not.toContain('disabled=""');
    });

    it('deve renderizar botão de concluída quando progresso for 1', () => {
      const html = renderToString(
        <GoalProgressControl
          goal={binaryCompleted}
          isWeekClosed={false}
          onProgressChange={vi.fn()}
        />
      );

      expect(html).toContain('Concluída');
      expect(html).toContain('aria-label="Desmarcar meta concluída"');
    });

    it('deve desabilitar botão quando a semana estiver fechada', () => {
      const html = renderToString(
        <GoalProgressControl
          goal={binaryPending}
          isWeekClosed={true}
          onProgressChange={vi.fn()}
        />
      );

      expect(html).toContain('disabled=""');
    });
  });

  describe('Metas QUANTITY', () => {
    it('deve renderizar controle de incremento e decremento com valor atual', () => {
      const html = renderToString(
        <GoalProgressControl
          goal={quantityGoal}
          isWeekClosed={false}
          onProgressChange={vi.fn()}
        />
      );

      expect(html).toContain('value="2"');
      expect(html).toContain('/ 5');
      expect(html).toContain('Atingir meta');
    });

    it('deve desabilitar botão de decremento quando o valor for 0', () => {
      const html = renderToString(
        <GoalProgressControl
          goal={quantityZero}
          isWeekClosed={false}
          onProgressChange={vi.fn()}
        />
      );

      expect(html).toContain('disabled="" aria-label="Diminuir progresso"');
    });

    it('deve desabilitar todos os controles quando a semana estiver fechada', () => {
      const html = renderToString(
        <GoalProgressControl
          goal={quantityGoal}
          isWeekClosed={true}
          onProgressChange={vi.fn()}
        />
      );

      expect(html).toContain('disabled="" aria-label="Diminuir progresso"');
      expect(html).toContain('disabled="" aria-label="Aumentar progresso"');
      expect(html).toContain('disabled="" aria-label="Progresso atual"');
      expect(html).not.toContain('Atingir meta');
    });
  });
});
