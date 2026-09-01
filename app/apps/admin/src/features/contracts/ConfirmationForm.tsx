import type { Quote } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { QuoteConfirmation } from './QuoteConfirmation';
import { WizardActions } from './WizardActions';

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
      <label className="flex min-h-touch cursor-pointer items-center gap-3 rounded-control border border-line p-3 font-bold">
        <input
          checked={props.confirmed}
          onChange={(event) => props.onConfirm(event.target.checked)}
          required
          type="checkbox"
        />
        {t('contractConfirm')}
      </label>
      <WizardActions
        busy={props.busy}
        onBack={props.onBack}
        primaryLabel={t('contractSubmit')}
        showBack
      />
    </form>
  );
}
