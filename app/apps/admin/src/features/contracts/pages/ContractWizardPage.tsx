import { useTranslation } from 'react-i18next';
import { ContractProgress } from '@/features/contracts/components/layout/ContractProgress';
import { ContractSummary } from '@/features/contracts/components/layout/ContractSummary';
import { ContractWizardContent } from '@/features/contracts/components/ContractWizardContent';
import { useContractWizard } from '@/features/contracts/hooks/use-contract-wizard';

export function ContractWizardPage() {
  const { t } = useTranslation();
  const wizard = useContractWizard();
  return (
    <section className="grid min-w-0 gap-5">
      <header>
        <p className="text-sm font-bold text-brand">Sprint 3</p>
        <h1 className="text-3xl font-black">{t('contractTitle')}</h1>
      </header>
      <ContractProgress step={wizard.state.step} />
      {wizard.error ? (
        <div
          className="rounded-control border border-negative bg-negative-soft p-3 font-bold text-negative"
          role="alert"
        >
          ⛔ {wizard.error}
        </div>
      ) : null}
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <main className="surface-card min-w-0 p-4 sm:p-6" data-mobile-card>
          <ContractWizardContent wizard={wizard} />
        </main>
        <ContractSummary quote={wizard.state.quote} />
      </div>
    </section>
  );
}
