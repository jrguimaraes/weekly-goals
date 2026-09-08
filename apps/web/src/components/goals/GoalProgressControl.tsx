'use client';

import React, { useState } from 'react';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { Goal } from '../../types/goal';

interface GoalProgressControlProps {
  goal: Goal;
  isWeekClosed: boolean;
  onProgressChange: (goalId: string, newValue: number) => Promise<void>;
}

export function GoalProgressControl({
  goal,
  isWeekClosed,
  onProgressChange,
}: GoalProgressControlProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [prevCurrentValue, setPrevCurrentValue] = useState(goal.currentValue);
  const [inputValue, setInputValue] = useState(String(goal.currentValue));

  if (prevCurrentValue !== goal.currentValue) {
    setPrevCurrentValue(goal.currentValue);
    setInputValue(String(goal.currentValue));
  }

  async function handleBinaryToggle() {
    if (isWeekClosed || isUpdating) return;
    const nextValue = goal.currentValue === 1 ? 0 : 1;
    setIsUpdating(true);
    try {
      await onProgressChange(goal.id, nextValue);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleQuantityStep(delta: number) {
    if (isWeekClosed || isUpdating) return;
    const nextValue = Math.max(0, Number(goal.currentValue) + delta);
    if (nextValue === goal.currentValue) return;

    setIsUpdating(true);
    try {
      await onProgressChange(goal.id, nextValue);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleQuantityDirectSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (isWeekClosed || isUpdating) return;

    const parsed = Number(inputValue);
    if (isNaN(parsed) || parsed < 0) {
      // Restaura o valor anterior se inválido
      setInputValue(String(goal.currentValue));
      return;
    }

    if (parsed === goal.currentValue) return;

    setIsUpdating(true);
    try {
      await onProgressChange(goal.id, parsed);
    } finally {
      setIsUpdating(false);
    }
  }

  if (goal.type === 'BINARY') {
    const isCompleted = goal.currentValue === 1;

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleBinaryToggle}
          disabled={isWeekClosed || isUpdating}
          aria-label={isCompleted ? 'Desmarcar meta concluída' : 'Marcar meta como concluída'}
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors ${
            isCompleted
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          {isUpdating ? (
            <LoadingSpinner size="sm" />
          ) : isCompleted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <div className="h-4 w-4 rounded border border-slate-400 bg-white dark:border-slate-600 dark:bg-slate-700" />
          )}
          <span>{isCompleted ? 'Concluída' : 'Concluir'}</span>
        </button>
      </div>
    );
  }

  // QUANTITY
  const isZero = goal.currentValue <= 0;
  const isCompleted = goal.currentValue >= goal.targetValue;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white shadow-xs dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => handleQuantityStep(-1)}
          disabled={isWeekClosed || isUpdating || isZero}
          aria-label="Diminuir progresso"
          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors rounded-l-lg text-sm font-bold dark:text-slate-300 dark:hover:bg-slate-700"
        >
          −
        </button>

        <form onSubmit={handleQuantityDirectSubmit} className="flex items-center">
          <input
            type="number"
            min="0"
            step="any"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => handleQuantityDirectSubmit()}
            disabled={isWeekClosed || isUpdating}
            aria-label="Progresso atual"
            className="w-14 text-center text-xs font-bold text-slate-800 focus:outline-none focus:bg-indigo-50/50 dark:focus:bg-indigo-950/40 py-1 dark:text-slate-100"
          />
        </form>

        <button
          type="button"
          onClick={() => handleQuantityStep(1)}
          disabled={isWeekClosed || isUpdating}
          aria-label="Aumentar progresso"
          className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors rounded-r-lg text-sm font-bold dark:text-slate-300 dark:hover:bg-slate-700"
        >
          +
        </button>
      </div>

      <span className="text-xs text-slate-400 dark:text-slate-500">{`/ ${goal.targetValue}`}</span>

      {isUpdating && <LoadingSpinner size="sm" />}

      {!isWeekClosed && !isCompleted && (
        <button
          type="button"
          onClick={() => onProgressChange(goal.id, goal.targetValue)}
          disabled={isUpdating}
          aria-label="Atingir meta imediatamente"
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline-offset-2 hover:underline transition-colors dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          Atingir meta
        </button>
      )}
    </div>
  );
}
