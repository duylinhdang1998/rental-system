import { useState } from 'react';
import { pnlExportUrl, type PnlQueryState } from '@/features/reporting/api/report-api';
import { usePnl } from '@/features/reporting/hooks/use-pnl';
import { defaultPnlQuery, pnlIssue } from '@/features/reporting/lib/pnl-presentation';

export function usePnlPage() {
  const [query, setQuery] = useState(() => defaultPnlQuery(new Date()));
  const issue = pnlIssue(query);
  const report = usePnl(query, issue === null);
  return {
    exportUrl: pnlExportUrl(query),
    issue,
    query,
    report,
    setField: (field: keyof PnlQueryState, value: string) =>
      setQuery((current) => ({ ...current, [field]: value })),
  };
}
