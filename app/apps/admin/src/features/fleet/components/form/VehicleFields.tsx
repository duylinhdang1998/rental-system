import type { VehicleInput } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';
import { VehicleTypeField } from './VehicleTypeField';

interface VehicleFieldsProps {
  change: (field: keyof VehicleInput, value: string) => void;
  input: VehicleInput;
}

const VEHICLE_FIELDS = [
  { field: 'code', id: 'vehicle-code', label: 'vehicleCode' },
  { field: 'plate', id: 'vehicle-plate', label: 'vehiclePlate' },
  { field: 'model', id: 'vehicle-model', label: 'vehicleModel' },
  { field: 'color', id: 'vehicle-color', label: 'vehicleColor' },
  { field: 'year', id: 'vehicle-year', label: 'vehicleYear', min: '1990', type: 'number' },
] as const;

export function VehicleFields({ change, input }: VehicleFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {VEHICLE_FIELDS.map((field) => (
        <TextField
          data-dialog-autofocus={field.field === 'code' ? '' : undefined}
          id={field.id}
          key={field.id}
          label={t(field.label)}
          min={'min' in field ? field.min : undefined}
          onChange={(event) => change(field.field, event.target.value)}
          required
          type={'type' in field ? field.type : undefined}
          value={input[field.field]}
        />
      ))}
      <VehicleTypeField onChange={(value) => change('typeCode', value)} value={input.typeCode} />
    </div>
  );
}
