import { AlertTriangle, RotateCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { useCurrentPricing } from './use-pricing-settings';

interface PricingSettingsStateProps {
  pricing: ReturnType<typeof useCurrentPricing>;
}

export function PricingSettingsState({ pricing }: PricingSettingsStateProps) {
  const { t } = useTranslation();
  if (pricing.isPending)
    return (
      <div className="surface-card grid gap-4 p-6" role="status">
        <div className="h-6 w-56 animate-pulse rounded-control bg-brand-soft" />
        <div className="h-24 animate-pulse rounded-control bg-panel-subtle" />
        <span className="sr-only">{t('loadingPricingSettings')}</span>
      </div>
    );
  if (!pricing.isError) return null;
  return (
    <div className="surface-card grid justify-items-start gap-3 p-6" role="alert">
      <AlertTriangle aria-hidden className="size-8 text-negative" />
      <p className="font-bold text-ink">{t('pricingSettingsError')}</p>
      <button
        className="button-base border border-line bg-panel text-brand"
        onClick={() => void pricing.refetch()}
        type="button"
      >
        <RotateCw aria-hidden className="size-5" /> {t('retry')}
      </button>
    </div>
  );
}
