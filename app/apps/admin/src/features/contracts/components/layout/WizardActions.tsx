import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

interface Props {
  busy?: boolean;
  primaryLabel?: string;
  showBack: boolean;
  onBack: () => void;
}

export function WizardActions({ busy, primaryLabel, showBack, onBack }: Props) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap justify-end gap-3 pt-3">
      {showBack ? (
        <Button onClick={onBack} type="button" variant="outline">
          {t('contractBack')}
        </Button>
      ) : null}
      <Button disabled={busy} type="submit">
        {busy ? '…' : (primaryLabel ?? t('contractNext'))}
      </Button>
    </div>
  );
}
