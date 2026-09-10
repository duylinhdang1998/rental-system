import { MAX_REPORT_DAYS, type ReportRange } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import type { RangeIssue } from '@/features/reporting/lib/report-presentation';
import { TextField } from '@/shared/ui/TextField';

interface ReportRangeFormProps {
  issue: RangeIssue;
  onChange: (field: keyof ReportRange, value: string) => void;
  range: ReportRange;
}

export function ReportRangeForm({ issue, onChange, range }: ReportRangeFormProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="report-from"
          label={t('reportFrom')}
          onChange={(event) => onChange('from', event.target.value)}
          type="date"
          value={range.from}
        />
        <TextField
          id="report-to"
          label={t('reportTo')}
          onChange={(event) => onChange('to', event.target.value)}
          type="date"
          value={range.to}
        />
      </div>
      {issue ? (
        <p className="text-sm font-semibold text-negative" role="alert">
          {t(`reportRangeIssue.${issue}`, { days: MAX_REPORT_DAYS })}
        </p>
      ) : null}
    </div>
  );
}
