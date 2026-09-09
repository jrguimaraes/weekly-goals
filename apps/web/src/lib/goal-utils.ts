import type { Goal, GoalPriority } from '../types/goal';

const PRIORITY_WEIGHT: Record<GoalPriority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Ordena uma lista de metas pela prioridade em ordem decrescente (HIGH > MEDIUM > LOW).
 * Em caso de empate de prioridade, preserva a ordem cronológica por data de criação.
 */
export function sortGoalsByPriority(goals: Goal[]): Goal[] {
  return [...goals].sort((a, b) => {
    const pDiff = (PRIORITY_WEIGHT[b.priority] ?? 0) - (PRIORITY_WEIGHT[a.priority] ?? 0);
    if (pDiff !== 0) return pDiff;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
}
