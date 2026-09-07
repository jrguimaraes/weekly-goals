import React from 'react';
import { MetricsCard } from '../dashboard/MetricsCard';
import type { ReportSnapshot } from '../../types/report';

interface ReportSummaryMetricsProps {
  report: ReportSnapshot;
}

export function ReportSummaryMetrics({ report }: ReportSummaryMetricsProps) {
  const incompleteGoals = Math.max(0, report.totalGoals - report.completedGoals);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricsCard
        title="Taxa de Conclusão"
        value={`${report.completionRate}%`}
        description={`${report.completedGoals} de ${report.totalGoals} metas totalmente cumpridas`}
        percentage={report.completionRate}
        variant="emerald"
      />

      <MetricsCard
        title="Taxa de Progresso"
        value={`${report.progressRate}%`}
        description="Avanço ponderado considerando progresso acumulado"
        percentage={report.progressRate}
        variant="indigo"
      />

      <MetricsCard
        title="Metas Concluídas"
        value={report.completedGoals}
        description="Alcançaram 100% da meta planejada"
        percentage={
          report.totalGoals > 0
            ? Math.round((report.completedGoals / report.totalGoals) * 100)
            : 0
        }
        variant="slate"
      />

      <MetricsCard
        title="Metas Incompletas"
        value={incompleteGoals}
        description="Não atingiram a totalidade no fechamento"
        percentage={
          report.totalGoals > 0
            ? Math.round((incompleteGoals / report.totalGoals) * 100)
            : 0
        }
        variant="amber"
      />
    </div>
  );
}
