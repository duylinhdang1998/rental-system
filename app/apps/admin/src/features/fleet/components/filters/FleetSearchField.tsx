import { useTranslation } from 'react-i18next';
import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';

interface FleetSearchFieldProps {
  onChange: (value: string) => void;
  value: string;
}

export function FleetSearchField({ onChange, value }: FleetSearchFieldProps) {
  const { t } = useTranslation();
  return (
    <Field>
      <FieldLabel htmlFor="fleet-search">{t('search')}</FieldLabel>
      <Input
        aria-label={t('searchVehicles')}
        id="fleet-search"
        onChange={(event) => onChange(event.target.value)}
        type="search"
        value={value}
      />
    </Field>
  );
}
