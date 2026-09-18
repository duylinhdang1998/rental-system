import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/shared/ui/CheckboxField';

interface DamageCatalogHeaderProps {
  onCreate: () => void;
  onShowInactiveChange: (value: boolean) => void;
  showInactive: boolean;
}

export function DamageCatalogHeader({
  onCreate,
  onShowInactiveChange,
  showInactive,
}: DamageCatalogHeaderProps) {
  const { t } = useTranslation();
  return (
    <header className="grid gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">{t('damageItemTitle')}</h1>
          <p className="mt-1 text-ink-muted">{t('damageItemSubtitle')}</p>
        </div>
        <Button onClick={onCreate} type="button">
          <Plus aria-hidden data-icon="inline-start" />
          {t('damageItemAdd')}
        </Button>
      </div>
      <CheckboxField
        checked={showInactive}
        id="damage-item-show-inactive"
        label={t('damageItemShowInactive')}
        onChange={onShowInactiveChange}
      />
    </header>
  );
}
