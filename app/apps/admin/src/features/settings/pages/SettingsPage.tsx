import { SettingsHeader } from '../components/SettingsHeader';
import { PricingSettingsState } from '../components/PricingSettingsState';
import { LateReturnSettingsForm } from '../components/LateReturnSettingsForm';
import { useCurrentPricing } from '../hooks/use-pricing-settings';

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
