import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ReportHeader } from './ReportHeader';
import { ReportSummaryMetrics } from './ReportSummaryMetrics';
import { ReportCategories } from './ReportCategories';
import { ReportHighlights } from './ReportHighlights';
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
    totalGoals: 3,
    completedGoals: 1,
    completionRate: 33.3,
    progressRate: 61.1,
    metrics: {
      totalGoals: 3,
      completedGoals: 1,
      completionRate: 33.3,
      progressRate: 61.1,
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
        totalGoals: 2,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 25,
      },
    ],
    goals: [
      {
        id: 'g-1',
        title: 'Treinar musculação',
        description: 'Mínimo 45 min',
        notes: 'Superei a meta com um treino a mais no sábado',
        type: 'QUANTITY',
        priority: 'HIGH',
        targetValue: 3,
        currentValue: 4,
        status: 'COMPLETED',
        completedAt: '2026-09-10T15:00:00.000Z',
        categoryId: 'cat-1',
        categoryName: 'Saúde',
      },
      {
        id: 'g-2',
        title: 'Ler 100 páginas',
        description: null,
        notes: 'Não concluído por imprevisto na viagem',
        type: 'QUANTITY',
        priority: 'MEDIUM',
        targetValue: 100,
        currentValue: 50,
        status: 'IN_PROGRESS',
        completedAt: null,
        categoryId: 'cat-2',
        categoryName: 'Estudos',
      },
      {
        id: 'g-3',
        title: 'Curso de Docker',
        description: null,
        notes: null,
        type: 'BINARY',
        priority: 'LOW',
        targetValue: 1,
        currentValue: 0,
        status: 'PENDING',
        completedAt: null,
        categoryId: 'cat-2',
        categoryName: 'Estudos',
      },
    ],
  };

  describe('ReportHeader', () => {
    it('deve renderizar título humanizado, período e data de encerramento sem jargões técnicos', () => {
      const html = renderToString(<ReportHeader report={mockReport} />);

      expect(html).toContain('Weekly Goals');
      expect(html).toContain('Resumo da Semana');
      expect(html).toContain('07/09/2026 a 13/09/2026');
      expect(html).toContain('Semana encerrada em 13/09/2026');
      expect(html).toContain('Semana Fechada');
      expect(html).toContain('Imprimir / Salvar PDF');
      expect(html).not.toContain('Snapshot Imutável');
      expect(html).not.toContain('dados preservados deterministicamente');
    });
  });

  describe('ReportSummaryMetrics', () => {
    it('deve renderizar linha compacta com Progresso Geral, Conclusão, Concluídas e Não Concluídas', () => {
      const html = renderToString(<ReportSummaryMetrics report={mockReport} />);

      expect(html).toContain('Progresso Geral');
      expect(html).toContain('61,1%');
      expect(html).toContain('Taxa de Conclusão');
      expect(html).toContain('33,3%');
      expect(html).toContain('Metas Concluídas');
      expect(html).toContain('1 / 3');
      expect(html).toContain('Metas Não Concluídas');
      expect(html).toContain('2');
      expect(html).not.toContain('Avanço ponderado');
    });
  });

  describe('ReportCategories', () => {
    it('deve renderizar cards compactos por categoria com progresso e conclusão', () => {
      const html = renderToString(<ReportCategories categories={mockReport.categories} />);

      expect(html).toContain('Desempenho por Categoria');
      expect(html).toContain('Saúde');
      expect(html).toContain('1 / 1 concluídas');
      expect(html).toContain('Progresso: <strong>100%</strong>');
      expect(html).toContain('Conclusão: <strong>100%</strong>');

      expect(html).toContain('Estudos');
      expect(html).toContain('0 / 2 concluídas');
      expect(html).toContain('Progresso: <strong>25%</strong>');
      expect(html).toContain('Conclusão: <strong>0%</strong>');
    });
  });

  describe('ReportHighlights', () => {
    it('deve exibir nos pontos positivos estritamente metas de alta prioridade concluídas ou que superaram o valor', () => {
      const html = renderToString(<ReportHighlights report={mockReport} />);

      expect(html).toContain('Destaques da Semana');
      expect(html).toContain('Pontos Positivos');
      expect(html).toContain('Treinar musculação');
      expect(html).toContain('superou o objetivo em <strong>+1</strong>');
      // Categorias e contagem genérica de metas parciais não devem mais figurar nos pontos positivos
      expect(html).not.toContain('Saúde: 1 de 1');
      expect(html).not.toContain('com progresso registrado ao final da semana');
      // Pontos de atenção continuam com metas não realizadas e categorias baixas
      expect(html).toContain('Pontos de Atenção');
      expect(html).toContain('1 meta não realizada');
      expect(html).toContain('Estudos:');
      expect(html).toContain('conclusão de 0%');
    });

    it('deve exibir meta de alta prioridade concluída sem ter superado o valor', () => {
      const reportWithHighCompleted: ReportSnapshot = {
        ...mockReport,
        goals: [
          {
            id: 'g-10',
            title: 'Projeto Crítico',
            description: null,
            notes: null,
            type: 'BINARY',
            priority: 'HIGH',
            targetValue: 1,
            currentValue: 1,
            status: 'COMPLETED',
            completedAt: '2026-09-10T15:00:00.000Z',
            categoryId: 'cat-1',
            categoryName: 'Saúde',
          },
        ],
      };

      const html = renderToString(<ReportHighlights report={reportWithHighCompleted} />);
      expect(html).toContain('Projeto Crítico');
      expect(html).toContain('(Alta prioridade): meta concluída com sucesso');
    });
  });

  describe('ReportGoalsList', () => {
    it('deve separar em 3 seções: Concluídas, Parciais e Não Realizadas', () => {
      const html = renderToString(<ReportGoalsList goals={mockReport.goals} />);

      expect(html).toContain('Metas Concluídas (1)');
      expect(html).toContain('Treinar musculação');
      expect(html).toContain('★ Objetivo superado em +1');
      expect(html).toContain('4 de 3 — 133%');

      expect(html).toContain('Metas Parciais (1)');
      expect(html).toContain('Ler 100 páginas');
      expect(html).toContain('50 de 100 — 50%');

      expect(html).toContain('Metas Não Realizadas (1)');
      expect(html).toContain('Curso de Docker');
      expect(html).toContain('Não realizada · 0%');
    });

    it('deve exibir contexto apenas quando a meta possuir observações', () => {
      const html = renderToString(<ReportGoalsList goals={mockReport.goals} />);

      expect(html).toContain('Superei a meta com um treino a mais no sábado');
      expect(html).toContain('Não concluído por imprevisto na viagem');
      // Meta g-3 não tem contexto
      expect(html).toContain('Curso de Docker');
    });
  });
});
