import { useTranslation } from 'react-i18next';
import type { RangeIssue } from '@/features/reporting/lib/report-presentation';

interface RangeIssueAlertProps {
  issue: RangeIssue;
  maxDays: number;
}

/** The one line under a range form that explains why nothing is being fetched. */
export function RangeIssueAlert({ issue, maxDays }: RangeIssueAlertProps) {
  const { t } = useTranslation();
  if (!issue) return null;
  return (
    <p className="text-sm font-semibold text-negative" role="alert">
      {t(`reportRangeIssue.${issue}`, { days: maxDays })}
    </p>
  );
}
