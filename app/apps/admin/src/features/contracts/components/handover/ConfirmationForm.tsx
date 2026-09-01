import type { Quote } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { QuoteConfirmation } from '@/features/contracts/components/pricing/QuoteConfirmation';
import { WizardActions } from '@/features/contracts/components/layout/WizardActions';
import { CheckboxField } from '@/shared/ui/CheckboxField';

interface Props {
  busy: boolean;
  confirmed: boolean;
  onBack: () => void;
  onConfirm: (value: boolean) => void;
  onSubmit: () => void;
  quote?: Quote;
}

export function ConfirmationForm(props: Props) {
  const { t } = useTranslation();
  return (
    <form
      className="grid gap-4"
      data-step="confirmation"
      onSubmit={(event) => {
        event.preventDefault();
        props.onSubmit();
      }}
    >
      <QuoteConfirmation quote={props.quote} />
      <CheckboxField
        checked={props.confirmed}
        className="min-h-touch rounded-control border border-line p-3 font-bold"
        id="contract-confirmation"
        label={t('contractConfirm')}
        onChange={props.onConfirm}
        required
      />
      <WizardActions
        busy={props.busy}
        onBack={props.onBack}
        primaryLabel={t('contractSubmit')}
        showBack
      />
    </form>
  );
}
