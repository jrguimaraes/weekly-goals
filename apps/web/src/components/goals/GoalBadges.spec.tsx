import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { GoalTypeBadge } from './GoalTypeBadge';
import { GoalPriorityBadge } from './GoalPriorityBadge';
import { GoalStatusBadge } from './GoalStatusBadge';

describe('Goal Badges', () => {
  describe('GoalTypeBadge', () => {
    it('deve renderizar badge para tipo BINARY', () => {
      const html = renderToString(<GoalTypeBadge type="BINARY" />);
      expect(html).toContain('Binária');
    });

    it('deve renderizar badge para tipo QUANTITY', () => {
      const html = renderToString(<GoalTypeBadge type="QUANTITY" />);
      expect(html).toContain('Quantitativa');
    });
  });

  describe('GoalPriorityBadge', () => {
    it('deve renderizar prioridade LOW com texto Baixa', () => {
      const html = renderToString(<GoalPriorityBadge priority="LOW" />);
      expect(html).toContain('Baixa');
    });

    it('deve renderizar prioridade MEDIUM com texto Média', () => {
      const html = renderToString(<GoalPriorityBadge priority="MEDIUM" />);
      expect(html).toContain('Média');
    });

    it('deve renderizar prioridade HIGH com texto Alta', () => {
      const html = renderToString(<GoalPriorityBadge priority="HIGH" />);
      expect(html).toContain('Alta');
    });
  });

  describe('GoalStatusBadge', () => {
    it('deve renderizar status PENDING com texto Pendente', () => {
      const html = renderToString(<GoalStatusBadge status="PENDING" />);
      expect(html).toContain('Pendente');
    });

    it('deve renderizar status IN_PROGRESS com texto Em Progresso', () => {
      const html = renderToString(<GoalStatusBadge status="IN_PROGRESS" />);
      expect(html).toContain('Em Progresso');
    });

    it('deve renderizar status COMPLETED com texto Concluída', () => {
      const html = renderToString(<GoalStatusBadge status="COMPLETED" />);
      expect(html).toContain('Concluída');
    });
  });
});
