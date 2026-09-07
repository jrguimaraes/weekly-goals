import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { MetricsCard } from './MetricsCard';

describe('MetricsCard', () => {
  it('deve renderizar título, valor, descrição e barra de porcentagem', () => {
    const html = renderToString(
      <MetricsCard
        title="Taxa de Conclusão"
        value="75%"
        description="3 de 4 metas totalmente concluídas"
        percentage={75}
        variant="emerald"
      />
    );

    expect(html).toContain('Taxa de Conclusão');
    expect(html).toContain('75%');
    expect(html).toContain('3 de 4 metas totalmente concluídas');
    expect(html).toContain('style="width:75%"');
    expect(html).toContain('bg-emerald-500');
  });

  it('deve renderizar ícone opcional quando fornecido', () => {
    const html = renderToString(
      <MetricsCard
        title="Taxa de Progresso"
        value="60%"
        description="Progresso acumulado"
        icon={<span data-testid="custom-icon">ICONE</span>}
      />
    );

    expect(html).toContain('Taxa de Progresso');
    expect(html).toContain('60%');
    expect(html).toContain('ICONE');
  });
});
