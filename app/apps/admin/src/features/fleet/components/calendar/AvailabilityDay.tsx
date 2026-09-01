import type { AvailabilityPeriod } from '@rental/contracts';
import { CalendarCheck2, Clock3, KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AvailabilityDayProps {
  period: AvailabilityPeriod;
  vehicleId: string;
}

const STYLES = {
  AVAILABLE: 'bg-positive-soft text-positive',
  HELD: 'bg-caution-soft text-caution',
  RENTED: 'bg-information-soft text-information',
};
const AVAILABILITY_ICONS = { AVAILABLE: CalendarCheck2, HELD: Clock3, RENTED: KeyRound };

export function AvailabilityDay({ period, vehicleId }: AvailabilityDayProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const Icon = AVAILABILITY_ICONS[period.state];
  const label = t(`availability.${period.state}`);
  const select = () => {
    const query = new URLSearchParams({ from: period.date, vehicleId });
    void navigate(`/contracts?${query.toString()}`);
  };
  return (
    <div role="gridcell">
      <Button
        aria-label={`${period.date}: ${label}`}
        className={`min-w-24 justify-start text-xs font-extrabold ${STYLES[period.state]}`}
        disabled={period.state !== 'AVAILABLE'}
        onClick={select}
        type="button"
      >
        <Icon aria-hidden data-icon="inline-start" />
        <span>{label}</span>
      </Button>
    </div>
  );
}
