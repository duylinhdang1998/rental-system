import { useState } from 'react';
import type { ReportRange } from '@rental/contracts';
import { revenueExportUrl } from '@/features/reporting/api/report-api';
import { useRevenueReport } from '@/features/reporting/hooks/use-revenue-report';
import { defaultReportRange, rangeIssue } from '@/features/reporting/lib/report-presentation';

export function useReportPage() {
  const [range, setRange] = useState(() => defaultReportRange(new Date()));
  const issue = rangeIssue(range);
  const report = useRevenueReport(range, issue === null);
  return {
    exportUrl: revenueExportUrl(range),
    issue,
    range,
    report,
    setField: (field: keyof ReportRange, value: string) =>
      setRange((current) => ({ ...current, [field]: value })),
  };
}
