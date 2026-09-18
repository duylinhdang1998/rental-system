import type { UseQueryResult } from '@tanstack/react-query';
import type { PnlReport } from '@rental/contracts';
import { PnlCardList } from '@/features/reporting/components/pnl/PnlCardList';
import { PnlTable } from '@/features/reporting/components/pnl/PnlTable';
import { PnlTotals } from '@/features/reporting/components/pnl/PnlTotals';
import { PnlTrendSection } from '@/features/reporting/components/pnl/PnlTrendSection';
import type { PnlIssue } from '@/features/reporting/lib/pnl-presentation';
import { ViewState } from '@/shared/ui/ViewState';

interface PnlBodyProps {
  issue: PnlIssue;
  report: UseQueryResult<PnlReport, Error>;
}

/** The form already explains an invalid month, so nothing else is rendered for it. */
export function PnlBody({ issue, report }: PnlBodyProps) {
  if (issue) return null;
  if (report.isPending) return <ViewState heading="section" state="loading" />;
  if (report.isError) {
    return <ViewState heading="section" onRetry={() => void report.refetch()} state="error" />;
  }
  const data = report.data;
  return (
    <>
      <PnlTotals totals={data.totals} />
      <PnlTrendSection months={data.months} />
      <PnlTable report={data} />
      <PnlCardList report={data} />
    </>
  );
}
