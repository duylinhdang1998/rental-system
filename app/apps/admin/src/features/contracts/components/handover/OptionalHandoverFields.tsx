import { useTranslation } from 'react-i18next';
import type { ContractDraftState } from '../../lib/contract-draft';
import { TextAreaField } from '@/shared/ui/TextAreaField';
import { TextField } from '@/shared/ui/TextField';

interface Props {
  draft: ContractDraftState;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
}

export function OptionalHandoverFields({ draft, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <TextField
        accept="image/*"
        id="contract-images"
        label={t('contractImageKey')}
        multiple
        onChange={(event) =>
          onChange(
            'imageObjectKey',
            event.target.files?.length ? `private/handovers/${crypto.randomUUID()}` : '',
          )
        }
        type="file"
      />
      <TextAreaField
        id="contract-notes"
        label={t('contractNotes')}
        onChange={(event) => onChange('notes', event.target.value)}
        value={draft.notes}
      />
    </div>
  );
}
