import { useTranslation } from 'react-i18next';
import type {
  AcquisitionFieldChange,
  AcquisitionFormValues,
} from '@/features/fleet/lib/acquisition-presentation';
import { TextField } from '@/shared/ui/TextField';

interface VehicleAcquisitionFieldsProps {
  onChange: AcquisitionFieldChange;
  values: AcquisitionFormValues;
}

interface FieldSpec {
  autofocus?: boolean;
  key: keyof AcquisitionFormValues;
  labelKey: string;
  max?: number;
  min?: number;
  required: boolean;
  type: 'date' | 'number';
}

const MAX_PRICE = 1_000_000_000_000;
const MAX_LIFE_MONTHS = 240;

const FIELDS: FieldSpec[] = [
  {
    autofocus: true,
    key: 'purchasePrice',
    labelKey: 'acquisitionPrice',
    max: MAX_PRICE,
    min: 0,
    required: true,
    type: 'number',
  },
  { key: 'purchasedOn', labelKey: 'acquisitionPurchasedOn', required: true, type: 'date' },
  {
    key: 'usefulLifeMonths',
    labelKey: 'acquisitionLife',
    max: MAX_LIFE_MONTHS,
    min: 1,
    required: true,
    type: 'number',
  },
  { key: 'salvageValue', labelKey: 'acquisitionSalvage', min: 0, required: false, type: 'number' },
];

export function VehicleAcquisitionFields({ onChange, values }: VehicleAcquisitionFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {FIELDS.map((field) => (
        <TextField
          data-dialog-autofocus={field.autofocus ? '' : undefined}
          id={`acquisition-${field.key}`}
          inputMode={field.type === 'number' ? 'numeric' : undefined}
          key={field.key}
          label={t(field.labelKey)}
          max={field.max}
          min={field.min}
          onChange={(event) => onChange(field.key, event.target.value)}
          required={field.required}
          type={field.type}
          value={values[field.key]}
        />
      ))}
    </div>
  );
}
