import { SettingsHeader } from '@/features/settings/components/SettingsHeader';
import { PricingSettingsState } from '@/features/settings/components/PricingSettingsState';
import { LateReturnSettingsForm } from '@/features/settings/components/LateReturnSettingsForm';
import { useCurrentPricing } from '@/features/settings/hooks/use-pricing-settings';

export function SettingsPage() {
  const pricing = useCurrentPricing();
  return (
    <section className="grid max-w-4xl gap-5">
      <SettingsHeader />
      <PricingSettingsState pricing={pricing} />
      {pricing.data ? <LateReturnSettingsForm pricing={pricing.data} /> : null}
    </section>
  );
}
