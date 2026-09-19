'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { reportsService } from '../../../../services/reports.service';
import { ReportHeader } from '../../../../components/reports/ReportHeader';
import { ReportSummaryMetrics } from '../../../../components/reports/ReportSummaryMetrics';
import { ReportCategories } from '../../../../components/reports/ReportCategories';
import { ReportHighlights } from '../../../../components/reports/ReportHighlights';
import { ReportGoalsList } from '../../../../components/reports/ReportGoalsList';
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner';
import { Alert } from '../../../../components/ui/Alert';
import { getApiErrorMessage } from '../../../../lib/api-client';
import { formatReportFileName } from '../../../../lib/date-utils';
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
              'Não foi possível carregar a retrospectiva semanal desta semana.'
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

  useEffect(() => {
    if (!report) return;

    // Garante que o título da aba do navegador nunca fique fixado com o nome do arquivo de exportação
    if (typeof document !== 'undefined' && document.title.startsWith('wg-')) {
      document.title = 'Weekly Goals';
    }

    const fileName = formatReportFileName(report.week.startDate, report.week.endDate);
    const originalTitle =
      typeof document !== 'undefined' && document.title && !document.title.startsWith('wg-')
        ? document.title
        : 'Weekly Goals';
    let wasDark = false;

    function handleBeforePrint() {
      wasDark = document.documentElement.classList.contains('dark');
      if (wasDark) {
        document.documentElement.classList.remove('dark');
      }
      document.title = fileName;
    }

    function handleAfterPrint() {
      document.title = originalTitle;
      if (wasDark) {
        document.documentElement.classList.add('dark');
      }
    }

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      if (typeof document !== 'undefined' && document.title.startsWith('wg-')) {
        document.title = originalTitle;
      }
    };
  }, [report]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-slate-500 font-medium dark:text-slate-400">
          Carregando retrospectiva da semana...
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
            'O relatório semanal consolidado somente é gerado quando a semana for formalmente encerrada (status CLOSED).'
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
    <div className="mx-auto max-w-4xl space-y-4 print:space-y-4 print:max-w-none">
      {/* 1. Cabeçalho da semana */}
      <ReportHeader report={report} />

      {/* 2. Resumo geral */}
      <ReportSummaryMetrics report={report} />

      {/* 3. Desempenho por categoria */}
      <ReportCategories categories={report.categories} />

      {/* 4. Destaques da semana */}
      <ReportHighlights report={report} />

      {/* 5, 6, 7. Metas (Concluídas, Em progresso, Pendentes) com Contexto */}
      <section className="space-y-2 pt-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 print:text-slate-800 dark:text-slate-300 break-after-avoid page-break-after-avoid">
          Detalhamento das Metas
        </h2>
        <ReportGoalsList goals={report.goals} />
      </section>
    </div>
  );
}
