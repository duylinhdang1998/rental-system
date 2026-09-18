import { useTranslation } from 'react-i18next';
import type { AsOfIssue } from '@/features/reporting/lib/economics-presentation';
import { TextField } from '@/shared/ui/TextField';

interface EconomicsAsOfFormProps {
  asOf: string;
  issue: AsOfIssue;
  onChange: (value: string) => void;
}

export function EconomicsAsOfForm({ asOf, issue, onChange }: EconomicsAsOfFormProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2">
      <TextField
        id="economics-as-of"
        label={t('economicsAsOf')}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={asOf}
      />
      {issue ? (
        <p className="text-sm font-semibold text-negative" role="alert">
          {t(`economicsAsOfIssue.${issue}`)}
        </p>
      ) : null}
    </div>
  );
}
