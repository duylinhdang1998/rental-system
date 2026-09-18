import { Coins } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useSession } from '@/features/auth/hooks/use-session';

interface VehicleAcquisitionButtonProps {
  code: string;
  onOpen: () => void;
}

/** Owner-only trigger; the API rejects Staff on PUT anyway (BR-10). */
export function VehicleAcquisitionButton({ code, onOpen }: VehicleAcquisitionButtonProps) {
  const { t } = useTranslation();
  const { user } = useSession();
  if (user?.role !== 'OWNER') return null;
  return (
    <Button
      aria-label={t('acquisitionTitle', { code })}
      onClick={onOpen}
      size="sm"
      type="button"
      variant="outline"
    >
      <Coins aria-hidden data-icon="inline-start" />
      {t('acquisitionAction')}
    </Button>
  );
}
