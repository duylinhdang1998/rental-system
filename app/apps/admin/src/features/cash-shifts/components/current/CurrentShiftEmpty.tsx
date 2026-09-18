import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface CurrentShiftEmptyProps {
  onOpenShift: () => void;
}

export function CurrentShiftEmpty({ onOpenShift }: CurrentShiftEmptyProps) {
  const { t } = useTranslation();
  return (
    <section className="surface-card grid gap-4 p-5 text-center" data-cash-shift-empty>
      <p className="text-ink-muted">{t('cashShiftEmpty')}</p>
      <Button className="justify-self-center" onClick={onOpenShift} type="button">
        {t('cashShiftOpen')}
      </Button>
    </section>
  );
}
