import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CloseWeekModal } from './CloseWeekModal';
import type { Week } from '../../types/week';

describe('CloseWeekModal', () => {
  const mockWeek: Week = {
    id: 'w-active-1',
    startDate: '2026-09-07T00:00:00.000Z',
    endDate: '2026-09-13T23:59:59.000Z',
    status: 'ACTIVE',
    closedAt: null,
    createdAt: '2026-09-07T00:00:00.000Z',
    updatedAt: '2026-09-07T00:00:00.000Z',
  };

  it('não deve renderizar quando isOpen for false', () => {
    const html = renderToString(
      <CloseWeekModal
        isOpen={false}
        onClose={vi.fn()}
        week={mockWeek}
        onSuccess={vi.fn()}
      />
    );

    expect(html).toBe('');
  });

  it('não deve renderizar quando week for null', () => {
    const html = renderToString(
      <CloseWeekModal
        isOpen={true}
        onClose={vi.fn()}
        week={null}
        onSuccess={vi.fn()}
      />
    );

    expect(html).toBe('');
  });

  it('deve renderizar aviso explícito de imutabilidade e botão de confirmação', () => {
    const html = renderToString(
      <CloseWeekModal
        isOpen={true}
        onClose={vi.fn()}
        week={mockWeek}
        onSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Encerrar Ciclo Semanal');
    expect(html).toContain('Operação definitiva e irreversível');
    expect(html).toContain('permanentemente congelados');
    expect(html).toContain('snapshot imutável do relatório semanal');
    expect(html).toContain('Confirmar Fechamento da Semana');
    expect(html).toContain('07/09/2026 a 13/09/2026');
  });
});
