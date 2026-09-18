import { useState } from 'react';
import type { ReportRange } from '@rental/contracts';
import { analyticsExportUrl } from '@/features/reporting/api/report-api';
import { useAnalytics } from '@/features/reporting/hooks/use-analytics';
import {
  analyticsRangeIssue,
  defaultAnalyticsRange,
} from '@/features/reporting/lib/analytics-presentation';

export function useAnalyticsPage() {
  const [range, setRange] = useState(() => defaultAnalyticsRange(new Date()));
  const issue = analyticsRangeIssue(range);
  const report = useAnalytics(range, issue === null);
  return {
    exportUrl: analyticsExportUrl(range),
    issue,
    range,
    report,
    setField: (field: keyof ReportRange, value: string) =>
      setRange((current) => ({ ...current, [field]: value })),
  };
}
