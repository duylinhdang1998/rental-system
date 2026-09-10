import type { UseQueryResult } from '@tanstack/react-query';
import type { RevenueReport } from '@rental/contracts';
import { ReportContent } from '@/features/reporting/components/layout/ReportContent';
import type { RangeIssue } from '@/features/reporting/lib/report-presentation';
import { ViewState } from '@/shared/ui/ViewState';

interface ReportBodyProps {
  issue: RangeIssue;
  report: UseQueryResult<RevenueReport, Error>;
}

/** The range form already explains an invalid range, so nothing else is rendered for it. */
export function ReportBody({ issue, report }: ReportBodyProps) {
  if (issue) return null;
  if (report.isPending) return <ViewState heading="section" state="loading" />;
  if (report.isError) {
    return <ViewState heading="section" onRetry={() => void report.refetch()} state="error" />;
  }
  return <ReportContent report={report.data} />;
}
