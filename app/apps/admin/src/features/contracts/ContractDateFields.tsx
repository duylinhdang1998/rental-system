import { useTranslation } from 'react-i18next';

interface Props {
  endLocal: string;
  onDate: (field: 'endLocal' | 'startLocal', value: string) => void;
  startLocal: string;
}

export function ContractDateFields(props: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm font-bold" htmlFor="contract-start">
        {t('contractStart')}
        <input
          className="field-control"
          id="contract-start"
          onChange={(event) => props.onDate('startLocal', event.target.value)}
          required
          type="datetime-local"
          value={props.startLocal}
        />
      </label>
      <label className="grid gap-1 text-sm font-bold" htmlFor="contract-end">
        {t('contractEnd')}
        <input
          className="field-control"
          id="contract-end"
          onChange={(event) => props.onDate('endLocal', event.target.value)}
          required
          type="datetime-local"
          value={props.endLocal}
        />
      </label>
    </div>
  );
}
