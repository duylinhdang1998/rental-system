import type { PricingVersion } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@/shared/ui/LoadingButton';
import { LateReturnFields } from '@/features/settings/components/LateReturnFields';
import { LateReturnSettingsHeader } from '@/features/settings/components/LateReturnSettingsHeader';
import { LateReturnSaveStatus } from '@/features/settings/components/LateReturnSaveStatus';
import { useLateReturnForm } from '@/features/settings/hooks/use-late-return-form';

interface LateReturnSettingsFormProps {
  pricing: PricingVersion;
}

export function LateReturnSettingsForm({ pricing }: LateReturnSettingsFormProps) {
  const { t } = useTranslation();
  const form = useLateReturnForm(pricing);
  return (
    <form className="surface-card grid gap-5 p-5 md:p-6" onSubmit={form.submit}>
      <LateReturnSettingsHeader createdAt={pricing.createdAt} />
      <LateReturnFields form={form} />
      <div className="rounded-control border border-line bg-panel-subtle p-4 text-sm leading-6 text-ink-muted">
        <strong className="text-ink">{t('lateReturnExampleTitle')}</strong>{' '}
        {t('lateReturnExample', form.example)}
      </div>
      <LateReturnSaveStatus publish={form.publish} />
      <div className="flex justify-end">
        <LoadingButton className="w-full sm:w-auto" loading={form.publish.isPending} type="submit">
          {t('saveLateReturnSettings')}
        </LoadingButton>
      </div>
    </form>
  );
}
