import type { UseQueryResult } from '@tanstack/react-query';
import type { FleetEconomicsReport } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { EconomicsCardList } from '@/features/reporting/components/economics/EconomicsCardList';
import { EconomicsTable } from '@/features/reporting/components/economics/EconomicsTable';
import { EconomicsTotals } from '@/features/reporting/components/economics/EconomicsTotals';
import type { AsOfIssue } from '@/features/reporting/lib/economics-presentation';
import { ViewState } from '@/shared/ui/ViewState';

interface EconomicsBodyProps {
  issue: AsOfIssue;
  report: UseQueryResult<FleetEconomicsReport, Error>;
}

/** The as-of form already explains an invalid day, so nothing else is rendered for it. */
export function EconomicsBody({ issue, report }: EconomicsBodyProps) {
  const { t } = useTranslation();
  if (issue) return null;
  if (report.isPending) return <ViewState heading="section" state="loading" />;
  if (report.isError) {
    return <ViewState heading="section" onRetry={() => void report.refetch()} state="error" />;
  }
  const data = report.data;
  return (
    <>
      <EconomicsTotals totals={data.totals} />
      {data.rows.length ? (
        <>
          <EconomicsTable report={data} />
          <EconomicsCardList report={data} />
        </>
      ) : (
        <p className="surface-card p-4 font-semibold text-ink-muted" data-economics-empty>
          {t('economicsEmpty')}
        </p>
      )}
    </>
  );
}
