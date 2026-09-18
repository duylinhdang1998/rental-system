import { FilePlus2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ContractPageHeader() {
  const { t } = useTranslation();
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-bold uppercase tracking-wide text-brand-ink">
          {t('contractWorkspace')}
        </p>
        <h1 className="mt-1 text-3xl font-extrabold">{t('contracts')}</h1>
        <p className="mt-1 text-ink-muted">{t('contractListSubtitle')}</p>
      </div>
      <Button asChild>
        <Link to="/contracts/new">
          <FilePlus2 aria-hidden data-icon="inline-start" />
          {t('createContract')}
        </Link>
      </Button>
    </header>
  );
}
