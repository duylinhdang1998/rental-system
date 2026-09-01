import { Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { PricingVersion } from '@rental/contracts';
import { Button } from '../../shared/ui/Button';
import { LateReturnFields } from './LateReturnFields';
import { LateReturnSaveStatus } from './LateReturnSaveStatus';
import { useLateReturnForm } from './use-late-return-form';

interface LateReturnSettingsFormProps {
  pricing: PricingVersion;
}

export function LateReturnSettingsForm({ pricing }: LateReturnSettingsFormProps) {
  const { t } = useTranslation();
  const form = useLateReturnForm(pricing);
  return (
    <form className="surface-card grid gap-5 p-5 md:p-6" onSubmit={form.submit}>
      <div className="flex items-start gap-3">
        <span className="grid size-touch shrink-0 place-items-center rounded-control bg-brand-soft text-brand">
          <Clock3 aria-hidden className="size-5" />
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-ink">{t('lateReturnSettingsTitle')}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-ink-muted">
            {t('lateReturnSettingsHelp')}
          </p>
        </div>
      </div>
      <LateReturnFields form={form} />
      <div className="rounded-control border border-line bg-panel-subtle p-4 text-sm leading-6 text-ink-muted">
        <strong className="text-ink">{t('lateReturnExampleTitle')}</strong>{' '}
        {t('lateReturnExample', form.example)}
      </div>
      <LateReturnSaveStatus publish={form.publish} />
      <div className="flex justify-end">
        <Button className="w-full sm:w-auto" loading={form.publish.isPending} type="submit">
          {t('saveLateReturnSettings')}
        </Button>
      </div>
    </form>
  );
}
