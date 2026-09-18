import type { VehicleInspection } from '@rental/contracts';
import { PackageCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ContractLineInspection } from '@/features/contracts/components/detail/ContractLineInspection';

interface ContractLineReturnProps {
  inspection: VehicleInspection | null;
  lineId: string;
  onReturn?: (() => void) | undefined;
}

/** Either the recorded inspection or, while the vehicle is still out, the per-line return action. */
export function ContractLineReturn({ inspection, lineId, onReturn }: ContractLineReturnProps) {
  const { t } = useTranslation();
  if (inspection) return <ContractLineInspection inspection={inspection} lineId={lineId} />;
  if (!onReturn) return null;
  return (
    <Button className="mt-3" onClick={onReturn} size="sm" type="button">
      <PackageCheck aria-hidden data-icon="inline-start" />
      {t('returnVehicle')}
    </Button>
  );
}
