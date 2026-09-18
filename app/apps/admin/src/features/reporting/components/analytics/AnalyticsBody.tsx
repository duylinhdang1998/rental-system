import type { UseQueryResult } from '@tanstack/react-query';
import type { AnalyticsReport } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { AnalyticsTotals } from '@/features/reporting/components/analytics/AnalyticsTotals';
import { DimensionTable } from '@/features/reporting/components/analytics/DimensionTable';
import { MonthSection } from '@/features/reporting/components/analytics/MonthSection';
import { SurchargeTable } from '@/features/reporting/components/analytics/SurchargeTable';
import { UtilisationTable } from '@/features/reporting/components/analytics/UtilisationTable';
import type { RangeIssue } from '@/features/reporting/lib/report-presentation';
import { ViewState } from '@/shared/ui/ViewState';

interface AnalyticsBodyProps {
  issue: RangeIssue;
  report: UseQueryResult<AnalyticsReport, Error>;
}

/** The range form already explains an invalid range, so nothing else is rendered for it. */
export function AnalyticsBody({ issue, report }: AnalyticsBodyProps) {
  const { t } = useTranslation();
  if (issue) return null;
  if (report.isPending) return <ViewState heading="section" state="loading" />;
  if (report.isError) {
    return <ViewState heading="section" onRetry={() => void report.refetch()} state="error" />;
  }
  const data = report.data;
  return (
    <>
      <AnalyticsTotals totals={data.totals} />
      {data.byMonth.length ? (
        <>
          <MonthSection rows={data.byMonth} />
          <div className="grid gap-5 lg:grid-cols-2">
            <DimensionTable dimension="type" rows={data.byType} />
            <DimensionTable dimension="vehicle" rows={data.byVehicle} />
            <DimensionTable dimension="nationality" rows={data.byNationality} />
            <SurchargeTable netVnd={data.totals.surchargeNetVnd} rows={data.surcharges} />
          </div>
        </>
      ) : (
        <p className="surface-card p-4 font-semibold text-ink-muted" data-analytics-empty>
          {t('analyticsEmpty')}
        </p>
      )}
      <UtilisationTable utilisation={data.utilisation} />
    </>
  );
}
