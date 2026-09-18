import type { Vehicle } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { vehicleOptions } from '@/features/expenses/lib/expense-presentation';
import { SelectField } from '@/shared/ui/SelectField';

interface ExpenseVehicleFieldProps {
  onChange: (vehicleId: string) => void;
  value: string;
  vehicles: Vehicle[];
}

/** Optional link to a vehicle: only linked expenses appear in the per-vehicle report. */
export function ExpenseVehicleField({ onChange, value, vehicles }: ExpenseVehicleFieldProps) {
  const { t } = useTranslation();
  return (
    <SelectField
      id="expense-vehicle"
      label={t('expenseVehicle')}
      onChange={onChange}
      options={vehicleOptions(vehicles, t('expenseNoVehicle'))}
      value={value}
    />
  );
}
