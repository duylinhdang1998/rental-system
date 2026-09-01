import { useTranslation } from 'react-i18next';
import { TextField } from '../../shared/ui/TextField';
import type { LateReturnForm } from './use-late-return-form';

interface LateReturnFieldsProps {
  form: LateReturnForm;
}

export function LateReturnFields({ form }: LateReturnFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        id="late-return-grace"
        label={t('lateReturnGraceLabel')}
        max={1440}
        min={0}
        onChange={(event) => form.setGraceMinutes(Number(event.target.value))}
        required
        type="number"
        value={form.graceMinutes}
      />
      <TextField
        id="late-return-rate"
        label={t('lateReturnRateLabel')}
        max={1_000_000_000}
        min={0}
        onChange={(event) => form.setHourlyRateVnd(Number(event.target.value))}
        required
        step={1000}
        type="number"
        value={form.hourlyRateVnd}
      />
    </div>
  );
}
