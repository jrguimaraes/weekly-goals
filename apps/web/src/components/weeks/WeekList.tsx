'use client';

import React from 'react';
import { WeekCard } from './WeekCard';
import type { Week } from '../../types/week';

interface WeekListProps {
  weeks: Week[];
  onActivate: (week: Week) => void;
  onCloseWeek?: (week: Week) => void;
}

export function WeekList({ weeks, onActivate, onCloseWeek }: WeekListProps) {
  if (weeks.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <svg
            className="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="mt-3 text-sm font-semibold text-slate-900">Nenhum ciclo semanal encontrado</h3>
        <p className="mt-1 text-xs text-slate-500">
          Nenhuma semana encontrada com o filtro selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {weeks.map((week) => (
        <WeekCard
          key={week.id}
          week={week}
          onActivate={onActivate}
          onCloseWeek={onCloseWeek}
        />
      ))}
    </div>
  );
}
