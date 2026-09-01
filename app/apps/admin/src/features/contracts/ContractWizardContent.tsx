import { ConfirmationStep } from './ConfirmationStep';
import { CustomerStep } from './CustomerStep';
import { HandoverStep } from './HandoverStep';
import { PricingStep } from './PricingStep';
import type { ContractWizard } from './use-contract-wizard';
import { VehicleStep } from './VehicleStep';

const CUSTOMER_STEP = 0;
const VEHICLE_STEP = 1;
const PRICING_STEP = 2;
const HANDOVER_STEP = 3;
const CONFIRMATION_STEP = 4;

function customerContent(wizard: ContractWizard) {
  const draft = wizard.state.draft;
  return (
    <CustomerStep
      acknowledged={draft.riskAcknowledged}
      customerId={draft.customerId}
      customers={wizard.customers}
      onAcknowledge={(value) => wizard.update('riskAcknowledged', value)}
      onChange={(id) => {
        wizard.update('customerId', id);
        wizard.update('riskAcknowledged', false);
      }}
      onNext={wizard.nextCustomer}
    />
  );
}

function vehicleContent(wizard: ContractWizard, back: () => void) {
  const draft = wizard.state.draft;
  const toggle = (id: string) =>
    wizard.update(
      'selectedVehicleIds',
      draft.selectedVehicleIds.includes(id)
        ? draft.selectedVehicleIds.filter((item) => item !== id)
        : [...draft.selectedVehicleIds, id],
    );
  return (
    <VehicleStep
      busy={wizard.busy}
      endLocal={draft.endLocal}
      onBack={back}
      onDate={wizard.update}
      onNext={() => void wizard.nextVehicles()}
      onToggle={toggle}
      selected={draft.selectedVehicleIds}
      startLocal={draft.startLocal}
      vehicles={wizard.vehicles}
    />
  );
}

function pricingContent(wizard: ContractWizard, back: () => void) {
  const draft = wizard.state.draft;
  const change = (field: 'deliveryFeeVnd' | 'overrideAmount' | 'overrideReason', value: string) =>
    wizard.update(field, field === 'deliveryFeeVnd' ? Number(value) : value);
  return (
    <PricingStep
      busy={wizard.busy}
      canOverride={wizard.canOverride}
      deliveryFeeVnd={draft.deliveryFeeVnd}
      onBack={back}
      onChange={change}
      onNext={() => void wizard.recalculate(true)}
      onRecalculate={() => void wizard.recalculate()}
      overrideAmount={draft.overrideAmount}
      overrideReason={draft.overrideReason}
      quote={wizard.state.quote}
    />
  );
}

function finalContent(wizard: ContractWizard, back: () => void) {
  const draft = wizard.state.draft;
  if (wizard.state.step === HANDOVER_STEP)
    return (
      <HandoverStep
        draft={draft}
        onBack={back}
        onChange={wizard.update}
        onNext={() => wizard.setState((current) => ({ ...current, step: CONFIRMATION_STEP }))}
      />
    );
  return (
    <ConfirmationStep
      busy={wizard.busy}
      code={wizard.state.contractCode}
      confirmed={draft.confirmed}
      contractId={wizard.state.contractId}
      onBack={back}
      onConfirm={(value) => wizard.update('confirmed', value)}
      onSubmit={() => void wizard.submit()}
      quote={wizard.state.quote}
    />
  );
}

export function ContractWizardContent({ wizard }: { wizard: ContractWizard }) {
  const back = () =>
    wizard.setState((current) => ({ ...current, step: Math.max(CUSTOMER_STEP, current.step - 1) }));
  if (wizard.state.step === CUSTOMER_STEP) return customerContent(wizard);
  if (wizard.state.step === VEHICLE_STEP) return vehicleContent(wizard, back);
  if (wizard.state.step === PRICING_STEP) return pricingContent(wizard, back);
  return finalContent(wizard, back);
}
