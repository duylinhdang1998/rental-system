import type { CustomerSummary, QuoteInput, Vehicle } from '@rental/contracts';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSession } from '../../auth/hooks/use-session';
import { fetchCustomers } from '../../customers/api/customers-api';
import { fetchVehicles } from '../../fleet/api/fleet-api';
import {
  loadContractState,
  saveContractState,
  toIso,
  type ContractDraftState,
  type ContractWizardState,
} from '../lib/contract-draft';
import { checkAvailability, createContract, fetchQuote } from '../api/contracts-api';
import { HANDOVER_STEP, PRICING_STEP, VEHICLE_STEP } from '../lib/wizard-steps';
type StateSetter = Dispatch<SetStateAction<ContractWizardState>>;
type TextSetter = Dispatch<SetStateAction<string>>;
type BusySetter = Dispatch<SetStateAction<boolean>>;

interface ActionContext {
  customers: CustomerSummary[];
  setBusy: BusySetter;
  setError: TextSetter;
  setState: StateSetter;
  state: ContractWizardState;
}

function message(reason: unknown) {
  return reason instanceof Error ? reason.message : 'Đã có lỗi xảy ra';
}

function quoteInput(draft: ContractDraftState): QuoteInput {
  const firstVehicle = draft.selectedVehicleIds[0] ?? '';
  const overrides =
    draft.overrideAmount && draft.overrideReason
      ? [
          {
            amountVnd: Number(draft.overrideAmount),
            reason: draft.overrideReason,
            vehicleId: firstVehicle,
          },
        ]
      : [];
  return {
    customerId: draft.customerId,
    deliveryFeeVnd: draft.deliveryFeeVnd,
    endAt: toIso(draft.endLocal),
    overrides,
    startAt: toIso(draft.startLocal),
    vehicleIds: draft.selectedVehicleIds,
  };
}

function useWizardData(setError: TextSetter) {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  useEffect(() => {
    void Promise.all([fetchCustomers(), fetchVehicles({})])
      .then(([customerData, vehicleData]) => {
        setCustomers(customerData.items);
        setVehicles(vehicleData.items);
      })
      .catch((reason: unknown) => setError(message(reason)));
  }, [setError]);
  return { customers, vehicles };
}

function updateAction(setState: StateSetter) {
  return (field: keyof ContractDraftState, value: ContractDraftState[keyof ContractDraftState]) => {
    const invalidatesQuote = [
      'customerId',
      'selectedVehicleIds',
      'startLocal',
      'endLocal',
    ].includes(field);
    setState((current) => ({
      ...current,
      draft: { ...current.draft, [field]: value },
      quote: invalidatesQuote ? undefined : current.quote,
    }));
  };
}

function customerAction(context: ActionContext) {
  return () => {
    const customer = context.customers.find((item) => item.id === context.state.draft.customerId);
    const unconfirmedRisk =
      customer?.warning?.code === 'BLACKLIST' && !context.state.draft.riskAcknowledged;
    if (!customer || unconfirmedRisk)
      return context.setError('Hãy chọn khách hàng và xác nhận cảnh báo nếu có.');
    context.setError('');
    context.setState((current) => ({ ...current, step: VEHICLE_STEP }));
  };
}

function vehicleAction(context: ActionContext) {
  return async () => {
    if (!context.state.draft.selectedVehicleIds.length)
      return context.setError('Hãy chọn ít nhất một xe.');
    context.setBusy(true);
    context.setError('');
    try {
      const input = quoteInput(context.state.draft);
      const availability = await checkAvailability({
        endAt: input.endAt,
        startAt: input.startAt,
        vehicleIds: input.vehicleIds,
      });
      if (!availability.available)
        return context.setError(
          `Xe ${availability.conflicts.map((item) => item.vehicleId).join(', ')} bị trùng lịch.`,
        );
      const quote = await fetchQuote(input);
      context.setState((current) => ({ ...current, quote, step: PRICING_STEP }));
    } catch (reason) {
      context.setError(message(reason));
    } finally {
      context.setBusy(false);
    }
  };
}

function pricingAction(context: ActionContext) {
  return async (advance = false) => {
    context.setBusy(true);
    context.setError('');
    try {
      const quote = await fetchQuote(quoteInput(context.state.draft));
      context.setState((current) => ({
        ...current,
        quote,
        step: advance ? HANDOVER_STEP : current.step,
      }));
    } catch (reason) {
      context.setError(message(reason));
    } finally {
      context.setBusy(false);
    }
  };
}

function contractPayload(draft: ContractDraftState) {
  return {
    ...quoteInput(draft),
    confirmed: true as const,
    handover: {
      deliveryPlace: draft.deliveryPlace,
      depositVnd: draft.depositVnd,
      fuelPercent: draft.fuelPercent,
      imageObjectKeys: draft.imageObjectKey ? [draft.imageObjectKey] : [],
      notes: draft.notes,
      retainedDocument: draft.retainedDocument,
    },
    idempotencyKey: draft.idempotencyKey,
  };
}

function submitAction(context: ActionContext) {
  return async () => {
    if (!context.state.draft.confirmed) return context.setError('Hãy xác nhận thông tin hợp đồng.');
    context.setBusy(true);
    context.setError('');
    try {
      const created = await createContract(contractPayload(context.state.draft));
      context.setState((current) => ({
        ...current,
        contractCode: created.code,
        contractCreatedAt: created.createdAt,
        contractId: created.id,
        quote: created.quote,
      }));
    } catch (reason) {
      context.setError(message(reason));
      context.setState((current) => ({ ...current, step: VEHICLE_STEP }));
    } finally {
      context.setBusy(false);
    }
  };
}

export function useContractWizard() {
  const [params] = useSearchParams();
  const [state, setState] = useState(() =>
    loadContractState(params.get('from') ?? undefined, params.get('vehicleId') ?? undefined),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { customers, vehicles } = useWizardData(setError);
  const { user } = useSession();
  useEffect(() => saveContractState(state), [state]);
  const context = { customers, setBusy, setError, setState, state };
  return {
    busy,
    canOverride: user?.role === 'OWNER',
    customers,
    error,
    nextCustomer: customerAction(context),
    nextVehicles: vehicleAction(context),
    recalculate: pricingAction(context),
    setError,
    setState,
    state,
    submit: submitAction(context),
    update: updateAction(setState),
    vehicles,
  };
}

export type ContractWizard = ReturnType<typeof useContractWizard>;
