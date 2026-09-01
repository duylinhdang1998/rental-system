import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { ContractDateFields } from '../handover/ContractDateFields';
import { ContractVehicleOptions } from './ContractVehicleOptions';
import { WizardActions } from '../layout/WizardActions';

interface Props {
  busy: boolean;
  endLocal: string;
  onBack: () => void;
  onDate: (field: 'endLocal' | 'startLocal', value: string) => void;
  onNext: () => void;
  onToggle: (id: string) => void;
  selected: string[];
  startLocal: string;
  vehicles: Vehicle[];
}

export function VehicleStep(props: Props) {
  const { t } = useTranslation();
  return (
    <form
      className="grid gap-4"
      data-step="vehicles"
      onSubmit={(event) => {
        event.preventDefault();
        props.onNext();
      }}
    >
      <div className="rounded-control bg-information-soft p-3 text-sm font-bold text-information">
        {t('contractFlexibleTime')}
      </div>
      <ContractDateFields
        endLocal={props.endLocal}
        onDate={props.onDate}
        startLocal={props.startLocal}
      />
      <ContractVehicleOptions
        onToggle={props.onToggle}
        selected={props.selected}
        vehicles={props.vehicles}
      />
      <WizardActions busy={props.busy} onBack={props.onBack} showBack />
    </form>
  );
}
