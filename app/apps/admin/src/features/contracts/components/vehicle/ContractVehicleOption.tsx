import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@/components/ui/checkbox';
import { FieldLabel } from '@/components/ui/field-label';

interface ContractVehicleOptionProps {
  onToggle: (id: string) => void;
  selected: boolean;
  vehicle: Vehicle;
}

export function ContractVehicleOption(props: ContractVehicleOptionProps) {
  const { t } = useTranslation();
  const unavailable = props.vehicle.status === 'MAINTENANCE' || props.vehicle.status === 'RETIRED';
  return (
    <FieldLabel
      className={`surface-card flex min-h-touch w-full cursor-pointer items-center gap-3 p-4 ${props.selected ? 'border-brand bg-brand-soft' : ''}`}
      htmlFor={`vehicle-${props.vehicle.id}`}
    >
      <Checkbox
        aria-label={`${props.vehicle.code} ${props.vehicle.plate}`}
        checked={props.selected}
        disabled={unavailable}
        id={`vehicle-${props.vehicle.id}`}
        onCheckedChange={() => props.onToggle(props.vehicle.id)}
      />
      <span>
        <strong>
          {props.vehicle.code} · {props.vehicle.plate}
        </strong>
        <small className="block text-ink-muted">
          {props.vehicle.model} · {t('contractAvailable')}
        </small>
      </span>
    </FieldLabel>
  );
}
