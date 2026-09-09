import type { ContractLine, Vehicle } from '@rental/contracts';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { SelectField } from '@/shared/ui/SelectField';
import { TextAreaField } from '@/shared/ui/TextAreaField';

export interface SwapFormValues {
  lineId: string;
  reason: string;
  replacementVehicleId: string;
}

interface SwapVehicleFieldsProps {
  candidates: Vehicle[];
  lines: ContractLine[];
  onChange: (field: keyof SwapFormValues, value: string) => void;
  values: SwapFormValues;
}

const MIN_REASON = 3;
const MAX_REASON = 240;

function candidateOptions(candidates: Vehicle[], t: TFunction) {
  const placeholder = candidates.length ? '—' : t('contractSwapNoCandidates');
  return [
    { label: placeholder, value: '' },
    ...candidates.map((vehicle) => ({
      label: `${vehicle.code} · ${vehicle.plate} · ${t(`vehicleStatus.${vehicle.status}`)}`,
      value: vehicle.id,
    })),
  ];
}

export function SwapVehicleFields({ candidates, lines, onChange, values }: SwapVehicleFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4">
      <SelectField
        id="contract-swap-line"
        label={t('contractSwapLine')}
        onChange={(value) => onChange('lineId', value)}
        options={lines.map((item) => ({ label: item.vehicleCode, value: item.id }))}
        value={values.lineId}
      />
      <SelectField
        id="contract-swap-vehicle"
        label={t('contractReplacementVehicle')}
        onChange={(value) => onChange('replacementVehicleId', value)}
        options={candidateOptions(candidates, t)}
        value={values.replacementVehicleId}
      />
      <TextAreaField
        id="contract-swap-reason"
        label={t('contractSwapReason')}
        maxLength={MAX_REASON}
        minLength={MIN_REASON}
        onChange={(event) => onChange('reason', event.target.value)}
        required
        value={values.reason}
      />
    </div>
  );
}
