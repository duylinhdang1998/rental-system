import type { Quote } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { OverrideFields } from './OverrideFields';
import { PriceLines } from './PriceLines';
import { WizardActions } from './WizardActions';

interface Props {
  busy: boolean;
  canOverride: boolean;
  deliveryFeeVnd: number;
  onBack: () => void;
  onChange: (field: 'deliveryFeeVnd' | 'overrideAmount' | 'overrideReason', value: string) => void;
  onNext: () => void;
  onRecalculate: () => void;
  overrideAmount: string;
  overrideReason: string;
  quote?: Quote;
}

export function PricingStep(props: Props) {
  const { t } = useTranslation();
  return (
    <form
      className="grid gap-4"
      data-step="pricing"
      onSubmit={(event) => {
        event.preventDefault();
        props.onNext();
      }}
    >
      <h2 className="text-lg font-extrabold">{t('contractPricingExplanation')}</h2>
      <PriceLines quote={props.quote} />
      <label className="grid gap-1 text-sm font-bold" htmlFor="delivery-fee">
        {t('contractDeliveryFee')}
        <input
          className="field-control"
          id="delivery-fee"
          min="0"
          onChange={(event) => props.onChange('deliveryFeeVnd', event.target.value)}
          type="number"
          value={props.deliveryFeeVnd}
        />
      </label>
      {props.canOverride ? <OverrideFields {...props} /> : null}
      <WizardActions busy={props.busy} onBack={props.onBack} showBack />
    </form>
  );
}
