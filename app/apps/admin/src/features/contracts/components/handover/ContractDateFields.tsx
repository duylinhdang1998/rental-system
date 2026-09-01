import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';

interface Props {
  endLocal: string;
  onDate: (field: 'endLocal' | 'startLocal', value: string) => void;
  startLocal: string;
}

export function ContractDateFields(props: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <TextField
        id="contract-start"
        label={t('contractStart')}
        onChange={(event) => props.onDate('startLocal', event.target.value)}
        required
        type="datetime-local"
        value={props.startLocal}
      />
      <TextField
        id="contract-end"
        label={t('contractEnd')}
        onChange={(event) => props.onDate('endLocal', event.target.value)}
        required
        type="datetime-local"
        value={props.endLocal}
      />
    </div>
  );
}
