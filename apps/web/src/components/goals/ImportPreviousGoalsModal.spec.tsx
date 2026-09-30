import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ImportPreviousGoalsModal } from './ImportPreviousGoalsModal';

vi.mock('../../services/goals.service', () => ({
  goalsService: {
    getImportable: vi.fn().mockResolvedValue({
      previousWeek: {
        id: 'w-prev',
        startDate: '2026-09-22T00:00:00.000Z',
        endDate: '2026-09-28T00:00:00.000Z',
      },
      goals: [
        {
          id: 'g-1',
          title: 'Anki',
          description: 'Revisar vocabulário',
          type: 'QUANTITY',
          priority: 'HIGH',
          targetValue: 3,
          categoryId: 'c-1',
          category: { id: 'c-1', name: 'Inglês', isActive: true },
          isAlreadyPresent: false,
        },
        {
          id: 'g-2',
          title: 'Treinar 5x',
          description: null,
          type: 'BINARY',
          priority: 'MEDIUM',
          targetValue: 1,
          categoryId: 'c-2',
          category: { id: 'c-2', name: 'Saúde', isActive: true },
          isAlreadyPresent: true,
        },
      ],
    }),
    importGoals: vi.fn(),
  },
}));

describe('ImportPreviousGoalsModal', () => {
  it('não deve renderizar quando isOpen for false', () => {
    const html = renderToString(
      <ImportPreviousGoalsModal
        isOpen={false}
        onClose={vi.fn()}
        weekId="w-current"
        onSuccess={vi.fn()}
      />
    );

    expect(html).toBe('');
  });

  it('deve renderizar o título e a estrutura base quando isOpen for true', () => {
    const html = renderToString(
      <ImportPreviousGoalsModal
        isOpen={true}
        onClose={vi.fn()}
        weekId="w-current"
        onSuccess={vi.fn()}
      />
    );

    expect(html).toContain('Importar Metas da Semana Anterior');
    expect(html).toContain('Reutilize as metas planejadas no ciclo anterior nesta nova semana');
    expect(html).toContain('Cancelar');
  });
});
