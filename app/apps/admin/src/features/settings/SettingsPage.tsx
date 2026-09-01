import { SettingsHeader } from './SettingsHeader';
import { PricingSettingsState } from './PricingSettingsState';
import { LateReturnSettingsForm } from './LateReturnSettingsForm';
import { useCurrentPricing } from './use-pricing-settings';

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
