import { useTranslation } from 'react-i18next';
import type { ContractDraftState } from './contract-draft';

interface Props {
  draft: ContractDraftState;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
}

export function HandoverFinancialFields({ draft, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <label className="grid gap-1 text-sm font-bold">
        {t('contractDeposit')}
        <input
          className="field-control"
          min="0"
          onChange={(event) => onChange('depositVnd', Number(event.target.value))}
          required
          type="number"
          value={draft.depositVnd}
        />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        {t('contractRetainedDocument')}
        <input
          className="field-control"
          onChange={(event) => onChange('retainedDocument', event.target.value)}
          value={draft.retainedDocument}
        />
      </label>
    </>
  );
}
