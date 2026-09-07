import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { HistoryWeekCard } from './HistoryWeekCard';
import type { Week } from '../../types/week';

describe('HistoryWeekCard', () => {
  const closedWeek: Week = {
    id: 'week-closed-1',
    startDate: '2026-09-01T00:00:00.000Z',
    endDate: '2026-09-07T23:59:59.999Z',
    status: 'CLOSED',
    closedAt: '2026-09-07T22:30:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
    updatedAt: '2026-09-07T22:30:00.000Z',
  };

  const activeWeek: Week = {
    id: 'week-active-2',
    startDate: '2026-09-08T00:00:00.000Z',
    endDate: '2026-09-14T23:59:59.999Z',
    status: 'ACTIVE',
    closedAt: null,
    createdAt: '2026-09-08T00:00:00.000Z',
    updatedAt: '2026-09-08T00:00:00.000Z',
  };

  const draftWeek: Week = {
    id: 'week-draft-3',
    startDate: '2026-09-15T00:00:00.000Z',
    endDate: '2026-09-21T23:59:59.999Z',
    status: 'DRAFT',
    closedAt: null,
    createdAt: '2026-09-15T00:00:00.000Z',
    updatedAt: '2026-09-15T00:00:00.000Z',
  };

  it('deve renderizar semana fechada com botão de relatório e informações consolidadas', () => {
    const html = renderToString(<HistoryWeekCard week={closedWeek} />);

    expect(html).toContain('Fechada');
    expect(html).toContain('Relatório Disponível');
    expect(html).toContain('Ciclo encerrado em');
    expect(html).toContain('/weeks/week-closed-1/report');
    expect(html).toContain('Ver Relatório');
    expect(html).toContain('Consultar Metas');
  });

  it('deve renderizar semana ativa com orientação sobre fechamento e link do painel', () => {
    const html = renderToString(<HistoryWeekCard week={activeWeek} />);

    expect(html).toContain('Ativa');
    expect(html).toContain('Ciclo atualmente em andamento');
    expect(html).toContain('Acompanhar no Painel');
    expect(html).toContain('Gerenciar Metas');
    expect(html).not.toContain('/weeks/week-active-2/report');
  });

  it('deve renderizar semana em planejamento com link para planejamento', () => {
    const html = renderToString(<HistoryWeekCard week={draftWeek} />);

    expect(html).toContain('Planejamento');
    expect(html).toContain('Ciclo cadastrado em fase de planejamento');
    expect(html).toContain('Ver Planejamento');
    expect(html).not.toContain('Ver Relatório');
  });

  it('deve ordenar corretamente uma lista de semanas da mais recente para a mais antiga', () => {
    const unorderedWeeks: Week[] = [closedWeek, draftWeek, activeWeek];
    const sorted = [...unorderedWeeks].sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

    expect(sorted.map((w) => w.id)).toEqual(['week-draft-3', 'week-active-2', 'week-closed-1']);
  });
});
