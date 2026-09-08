'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { reportsService } from '../../../../services/reports.service';
import { ReportHeader } from '../../../../components/reports/ReportHeader';
import { ReportSummaryMetrics } from '../../../../components/reports/ReportSummaryMetrics';
import { ReportCategories } from '../../../../components/reports/ReportCategories';
import { ReportGoalsList } from '../../../../components/reports/ReportGoalsList';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { Alert } from '../../../../components/ui/Alert';
import { getApiErrorMessage } from '../../../../lib/api-client';
import type { ReportSnapshot } from '../../../../types/report';

export default function WeekReportPage() {
  const params = useParams();
  const weekId = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : '';

  const [report, setReport] = useState<ReportSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadReport() {
      if (!weekId) return;
      try {
        const data = await reportsService.getReport(weekId);
        if (isMounted) {
          setReport(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            getApiErrorMessage(
              err,
              'Não foi possível carregar o relatório consolidado desta semana.'
            )
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadReport();

    return () => {
      isMounted = false;
    };
  }, [weekId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium dark:text-slate-400">
          Carregando relatório consolidado...
        </p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="space-y-6">
        <Link
          href={`/weeks/${weekId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors dark:text-slate-400 dark:hover:text-indigo-400"
        >
          ← Voltar para a Semana
        </Link>

        <Alert
          variant="warning"
          title="Relatório indisponível"
          message={
            error ||
            'O relatório consolidado somente é gerado quando a semana for formalmente encerrada (status CLOSED).'
          }
        />

        <div className="pt-2">
          <Link
            href={`/weeks/${weekId}`}
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
          >
            Acessar Acompanhamento da Semana
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 print:space-y-6">
      <ReportHeader report={report} />

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 print:text-sm dark:text-slate-100">
          Indicadores Globais de Produtividade
        </h2>
        <ReportSummaryMetrics report={report} />
      </section>

      <section className="space-y-3">
        <ReportCategories categories={report.categories} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-bold text-slate-900 print:text-sm dark:text-slate-100">
          Detalhamento Individual de Metas
        </h2>
        <ReportGoalsList goals={report.goals} />
      </section>
    </div>
  );
}
