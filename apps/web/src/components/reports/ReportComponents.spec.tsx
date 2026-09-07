import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ReportHeader } from './ReportHeader';
import { ReportSummaryMetrics } from './ReportSummaryMetrics';
import { ReportCategories } from './ReportCategories';
import { ReportGoalsList } from './ReportGoalsList';
import type { ReportSnapshot } from '../../types/report';

describe('Report Components', () => {
  const mockReport: ReportSnapshot = {
    version: 1,
    generatedAt: '2026-09-13T23:59:59.000Z',
    week: {
      id: 'w-1',
      startDate: '2026-09-07T00:00:00.000Z',
      endDate: '2026-09-13T23:59:59.000Z',
      status: 'CLOSED',
      closedAt: '2026-09-13T23:59:59.000Z',
      createdAt: '2026-09-07T00:00:00.000Z',
      updatedAt: '2026-09-13T23:59:59.000Z',
    },
    totalGoals: 2,
    completedGoals: 1,
    completionRate: 50,
    progressRate: 75,
    metrics: {
      totalGoals: 2,
      completedGoals: 1,
      completionRate: 50,
      progressRate: 75,
    },
    categories: [
      {
        categoryId: 'cat-1',
        categoryName: 'Saúde',
        totalGoals: 1,
        completedGoals: 1,
        completionRate: 100,
        progressRate: 100,
      },
      {
        categoryId: 'cat-2',
        categoryName: 'Estudos',
        totalGoals: 1,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 50,
      },
    ],
    goals: [
      {
        id: 'g-1',
        title: 'Treinar musculação',
        description: 'Mínimo 45 min',
        type: 'BINARY',
        priority: 'HIGH',
        targetValue: 1,
        currentValue: 1,
        status: 'COMPLETED',
        completedAt: '2026-09-10T15:00:00.000Z',
        categoryId: 'cat-1',
        categoryName: 'Saúde',
      },
      {
        id: 'g-2',
        title: 'Ler 100 páginas',
        description: null,
        type: 'QUANTITY',
        priority: 'MEDIUM',
        targetValue: 100,
        currentValue: 50,
        status: 'IN_PROGRESS',
        completedAt: null,
        categoryId: 'cat-2',
        categoryName: 'Estudos',
      },
    ],
  };

  describe('ReportHeader', () => {
    it('deve renderizar título, data de consolidação e badge de versão', () => {
      const html = renderToString(<ReportHeader report={mockReport} />);

      expect(html).toContain('07/09/2026 a 13/09/2026');
      expect(html).toContain('Snapshot Imutável');
      expect(html).toContain('v1');
      expect(html).toContain('Imprimir / Exportar');
    });
  });

  describe('ReportSummaryMetrics', () => {
    it('deve renderizar taxas e contagens de metas', () => {
      const html = renderToString(<ReportSummaryMetrics report={mockReport} />);

      expect(html).toContain('Taxa de Conclusão');
      expect(html).toContain('50%');
      expect(html).toContain('Taxa de Progresso');
      expect(html).toContain('75%');
      expect(html).toContain('Metas Concluídas');
      expect(html).toContain('Metas Incompletas');
    });
  });

  describe('ReportCategories', () => {
    it('deve renderizar categorias com métricas', () => {
      const html = renderToString(<ReportCategories categories={mockReport.categories} />);

      expect(html).toContain('Saúde');
      expect(html).toContain('1 de 1 meta concluída');
      expect(html).toContain('100%');

      expect(html).toContain('Estudos');
      expect(html).toContain('0 de 1 meta concluída');
      expect(html).toContain('50%');
    });
  });

  describe('ReportGoalsList', () => {
    it('deve separar metas concluídas e metas incompletas', () => {
      const html = renderToString(<ReportGoalsList goals={mockReport.goals} />);

      expect(html).toContain('Metas Concluídas (1)');
      expect(html).toContain('Treinar musculação');
      expect(html).toContain('Realizada com Sucesso');

      expect(html).toContain('Metas Incompletas ou Pendentes (1)');
      expect(html).toContain('Ler 100 páginas');
      expect(html).toContain('50');
      expect(html).toContain('100');
    });
  });
});
