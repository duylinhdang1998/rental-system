import { useTranslation } from 'react-i18next';
import type { ContractDraftState } from '@/features/contracts/lib/contract-draft';
import { TextField } from '@/shared/ui/TextField';

interface Props {
  draft: ContractDraftState;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
}

export function HandoverFinancialFields({ draft, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <>
      <TextField
        id="contract-deposit"
        label={t('contractDeposit')}
        min="0"
        onChange={(event) => onChange('depositVnd', Number(event.target.value))}
        required
        type="number"
        value={draft.depositVnd}
      />
      <TextField
        id="contract-retained-document"
        label={t('contractRetainedDocument')}
        onChange={(event) => onChange('retainedDocument', event.target.value)}
        value={draft.retainedDocument}
      />
    </>
  );
}
