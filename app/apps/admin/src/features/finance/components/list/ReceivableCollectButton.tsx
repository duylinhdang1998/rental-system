import { Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface ReceivableCollectButtonProps {
  onCollect: () => void;
}

export function ReceivableCollectButton({ onCollect }: ReceivableCollectButtonProps) {
  const { t } = useTranslation();
  return (
    <Button onClick={onCollect} size="sm" type="button">
      <Wallet aria-hidden data-icon="inline-start" />
      {t('paymentRecord')}
    </Button>
  );
}
