import { useTranslation } from 'react-i18next';
import type { ContractDraftState } from '@/features/contracts/lib/contract-draft';
import { TextField } from '@/shared/ui/TextField';

interface Props {
  draft: ContractDraftState;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
}

export function HandoverDeliveryFields({ draft, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        id="contract-delivery-place"
        label={t('contractDeliveryPlace')}
        minLength={2}
        onChange={(event) => onChange('deliveryPlace', event.target.value)}
        required
        value={draft.deliveryPlace}
      />
      <TextField
        id="contract-fuel"
        label={t('contractFuel')}
        max="100"
        min="0"
        onChange={(event) => onChange('fuelPercent', Number(event.target.value))}
        required
        type="number"
        value={draft.fuelPercent}
      />
    </>
  );
}
