import { useTranslation } from 'react-i18next';
import type { ContractDraftState } from './contract-draft';

interface Props {
  draft: ContractDraftState;
  onChange: (field: keyof ContractDraftState, value: string | number | boolean | string[]) => void;
}

export function OptionalHandoverFields({ draft, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <label className="grid gap-1 text-sm font-bold">
        {t('contractImageKey')}
        <input
          accept="image/*"
          className="field-control py-2"
          multiple
          onChange={(event) =>
            onChange(
              'imageObjectKey',
              event.target.files?.length ? `private/handovers/${crypto.randomUUID()}` : '',
            )
          }
          type="file"
        />
      </label>
      <label className="grid gap-1 text-sm font-bold">
        {t('contractNotes')}
        <textarea
          className="field-control min-h-24 py-3"
          onChange={(event) => onChange('notes', event.target.value)}
          value={draft.notes}
        />
      </label>
    </div>
  );
}
