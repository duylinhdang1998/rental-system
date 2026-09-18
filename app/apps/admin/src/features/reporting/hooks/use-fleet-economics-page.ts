import { useState } from 'react';
import { fleetEconomicsExportUrl } from '@/features/reporting/api/report-api';
import { useFleetEconomics } from '@/features/reporting/hooks/use-fleet-economics';
import { asOfIssue, defaultAsOf } from '@/features/reporting/lib/economics-presentation';

export function useFleetEconomicsPage() {
  const [asOf, setAsOf] = useState(() => defaultAsOf(new Date()));
  const issue = asOfIssue(asOf);
  const report = useFleetEconomics(asOf, issue === null);
  return {
    asOf,
    exportUrl: fleetEconomicsExportUrl(asOf),
    issue,
    report,
    setAsOf,
  };
}
