import { useTranslation } from 'react-i18next';
import { OverrideAmountField } from './OverrideAmountField';
import { OverrideReasonField } from './OverrideReasonField';
import { Button } from '@/components/ui/button';

interface Props {
  busy: boolean;
  onChange: (field: 'deliveryFeeVnd' | 'overrideAmount' | 'overrideReason', value: string) => void;
  onRecalculate: () => void;
  overrideAmount: string;
  overrideReason: string;
}

export function OverrideFields(props: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 rounded-control border border-line p-3 sm:grid-cols-2">
      <OverrideAmountField
        onChange={(value) => props.onChange('overrideAmount', value)}
        value={props.overrideAmount}
      />
      <OverrideReasonField
        amount={props.overrideAmount}
        onChange={(value) => props.onChange('overrideReason', value)}
        value={props.overrideReason}
      />
      <Button
        className="sm:col-span-2"
        disabled={props.busy}
        onClick={props.onRecalculate}
        type="button"
        variant="outline"
      >
        {t('contractRecalculate')}
      </Button>
    </div>
  );
}
