import { useTranslation } from 'react-i18next';
import type { ContractDraftState } from './contract-draft';

interface Props {
  draft: ContractDraftState;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
}

export function HandoverDeliveryFields({ draft, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <label className="grid gap-1 text-sm font-bold">
        {t('contractDeliveryPlace')}
        <input
          className="field-control"
          minLength={2}
          onChange={(event) => onChange('deliveryPlace', event.target.value)}
          required
          value={draft.deliveryPlace}
        />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        {t('contractFuel')}
        <input
          className="field-control"
          max="100"
          min="0"
          onChange={(event) => onChange('fuelPercent', Number(event.target.value))}
          required
          type="number"
          value={draft.fuelPercent}
        />
      </label>
    </>
  );
}
