import { Injectable } from '@nestjs/common';
import { GoalStatus, GoalType } from '@prisma/client';
import {
  CategoryMetricsResult,
  CategorySummaryCategory,
  GoalForMetrics,
  MetricsResult,
  WeekSummaryResponse,
  WeekSummaryWeek,
} from './metrics.types.js';

@Injectable()
export class MetricsService {
  /**
   * Arredonda um valor para até 2 casas decimais de forma precisa.
   */
  round(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }

  /**
   * Calcula o percentual individual de progresso de uma meta (0 a 100).
   * Para visualização e médias, o progresso é limitado a 100% (teto).
   */
  calculateGoalProgress(goal: GoalForMetrics): number {
    if (goal.type === GoalType.BINARY) {
      return goal.currentValue >= 1 || goal.status === GoalStatus.COMPLETED
        ? 100
        : 0;
    }

    if (goal.type === GoalType.QUANTITY) {
      if (goal.targetValue <= 0 || goal.currentValue <= 0) {
        return 0;
      }
      const rawProgress = (goal.currentValue / goal.targetValue) * 100;
      const normalized = Math.min(100, Math.max(0, rawProgress));
      return this.round(normalized);
    }

    return 0;
  }

  /**
   * Determina se uma meta individual é considerada concluída.
   */
  isGoalCompleted(goal: GoalForMetrics): boolean {
    if (goal.status === GoalStatus.COMPLETED) {
      return true;
    }
    if (goal.type === GoalType.BINARY) {
      return goal.currentValue >= 1;
    }
    if (goal.type === GoalType.QUANTITY) {
      return goal.targetValue > 0 && goal.currentValue >= goal.targetValue;
    }
    return false;
  }

  /**
   * Calcula as métricas consolidadas (Completion Rate e Progress Rate) de um conjunto de metas.
   * Se a lista estiver vazia, retorna taxas zeradas sem divisão por zero ou NaN.
   */
  calculateMetrics(goals: GoalForMetrics[]): MetricsResult {
    const totalGoals = goals.length;

    if (totalGoals === 0) {
      return {
        totalGoals: 0,
        completedGoals: 0,
        completionRate: 0,
        progressRate: 0,
      };
    }

    let completedGoals = 0;
    let totalProgressSum = 0;

    for (const goal of goals) {
      if (this.isGoalCompleted(goal)) {
        completedGoals++;
      }
      totalProgressSum += this.calculateGoalProgress(goal);
    }

    const completionRate = this.round((completedGoals / totalGoals) * 100);
    const progressRate = this.round(totalProgressSum / totalGoals);

    return {
      totalGoals,
      completedGoals,
      completionRate,
      progressRate,
    };
  }

  /**
   * Calcula as métricas agrupadas por categoria.
   * Categorias sem metas associadas retornam totalGoals = 0 e taxas 0%.
   */
  calculateCategoryMetrics(
    goals: GoalForMetrics[],
    categories: CategorySummaryCategory[],
  ): CategoryMetricsResult[] {
    const goalsByCategoryId = new Map<string, GoalForMetrics[]>();

    for (const goal of goals) {
      if (goal.categoryId) {
        const list = goalsByCategoryId.get(goal.categoryId) ?? [];
        list.push(goal);
        goalsByCategoryId.set(goal.categoryId, list);
      }
    }

    return categories.map((category) => {
      const categoryGoals = goalsByCategoryId.get(category.id) ?? [];
      const metrics = this.calculateMetrics(categoryGoals);

      return {
        categoryId: category.id,
        categoryName: category.name,
        ...metrics,
      };
    });
  }

  /**
   * Constrói o objeto consolidado de resumo da semana.
   */
  buildWeekSummary(
    week: WeekSummaryWeek,
    goals: GoalForMetrics[],
    categories: CategorySummaryCategory[],
  ): WeekSummaryResponse {
    const metrics = this.calculateMetrics(goals);
    const categoryMetrics = this.calculateCategoryMetrics(goals, categories);

    return {
      week: {
        id: week.id,
        startDate: week.startDate,
        endDate: week.endDate,
        status: week.status,
        closedAt: week.closedAt,
      },
      totalGoals: metrics.totalGoals,
      completedGoals: metrics.completedGoals,
      completionRate: metrics.completionRate,
      progressRate: metrics.progressRate,
      metrics,
      categories: categoryMetrics,
    };
  }
}
