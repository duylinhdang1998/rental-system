import { useTranslation } from 'react-i18next';
import type { PnlQueryState } from '@/features/reporting/api/report-api';
import { pnlMonthOptions, type PnlIssue } from '@/features/reporting/lib/pnl-presentation';
import { SelectField } from '@/shared/ui/SelectField';
import { TextField } from '@/shared/ui/TextField';

interface PnlFormProps {
  issue: PnlIssue;
  onChange: (field: keyof PnlQueryState, value: string) => void;
  query: PnlQueryState;
}

export function PnlForm({ issue, onChange, query }: PnlFormProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2">
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          id="pnl-to"
          label={t('pnlTo')}
          onChange={(event) => onChange('to', event.target.value)}
          type="month"
          value={query.to}
        />
        <SelectField
          id="pnl-months"
          label={t('pnlMonths')}
          onChange={(value) => onChange('months', value)}
          options={pnlMonthOptions((count) => t('pnlMonthsOption', { count }))}
          value={query.months}
        />
      </div>
      {issue ? (
        <p className="text-sm font-semibold text-negative" role="alert">
          {t(`pnlIssue.${issue}`)}
        </p>
      ) : null}
    </div>
  );
}
