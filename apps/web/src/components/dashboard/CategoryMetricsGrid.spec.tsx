import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CategoryMetricsGrid } from './CategoryMetricsGrid';
import type { CategoryMetricsResult } from '../../types/week';

describe('CategoryMetricsGrid', () => {
  const mockCategories: CategoryMetricsResult[] = [
    {
      categoryId: 'cat-1',
      categoryName: 'Saúde & Exercício',
      totalGoals: 2,
      completedGoals: 1,
      completionRate: 50,
      progressRate: 75,
    },
    {
      categoryId: 'cat-2',
      categoryName: 'Estudos',
      totalGoals: 1,
      completedGoals: 1,
      completionRate: 100,
      progressRate: 100,
    },
  ];

  it('deve renderizar cards de categoria com taxas de conclusão e progresso', () => {
    const html = renderToString(<CategoryMetricsGrid categories={mockCategories} />);

    expect(html).toContain('Saúde &amp; Exercício');
    expect(html).toContain('1 de 2 metas concluídas');
    expect(html).toContain('50%');
    expect(html).toContain('75%');

    expect(html).toContain('Estudos');
    expect(html).toContain('1 de 1 meta concluída');
    expect(html).toContain('100%');
  });

  it('deve renderizar mensagem amigável quando lista de categorias for vazia', () => {
    const html = renderToString(<CategoryMetricsGrid categories={[]} />);

    expect(html).toContain('Nenhuma categoria com metas vinculadas nesta semana.');
  });
});
