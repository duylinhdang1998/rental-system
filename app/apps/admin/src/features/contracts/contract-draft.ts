import type { Quote } from '@rental/contracts';

export interface ContractDraftState {
  confirmed: boolean;
  customerId: string;
  deliveryFeeVnd: number;
  deliveryPlace: string;
  depositVnd: number;
  endLocal: string;
  fuelPercent: number;
  idempotencyKey: string;
  imageObjectKey: string;
  notes: string;
  overrideAmount: string;
  overrideReason: string;
  retainedDocument: string;
  riskAcknowledged: boolean;
  selectedVehicleIds: string[];
  startLocal: string;
}

export interface ContractWizardState {
  contractId?: string;
  contractCode?: string;
  draft: ContractDraftState;
  quote?: Quote;
  step: number;
}

const STORAGE_KEY = 'rental-contract-draft-v1';
const PAD_LENGTH = 2;
const ISO_DATE_LENGTH = 10;

function nextDay(localDate: string): string {
  const date = new Date(`${localDate}T08:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(PAD_LENGTH, '0')}-${String(date.getDate()).padStart(PAD_LENGTH, '0')}T08:00`;
}

export function initialContractState(from?: string, vehicleId?: string): ContractWizardState {
  const today = from ?? new Date().toISOString().slice(0, ISO_DATE_LENGTH);
  return {
    draft: {
      confirmed: false,
      customerId: '',
      deliveryFeeVnd: 0,
      deliveryPlace: 'Cửa hàng',
      depositVnd: 0,
      endLocal: nextDay(today),
      fuelPercent: 100,
      idempotencyKey: crypto.randomUUID(),
      imageObjectKey: '',
      notes: '',
      overrideAmount: '',
      overrideReason: '',
      retainedDocument: '',
      riskAcknowledged: false,
      selectedVehicleIds: vehicleId ? [vehicleId] : [],
      startLocal: `${today}T08:00`,
    },
    step: 0,
  };
}

export function loadContractState(from?: string, vehicleId?: string): ContractWizardState {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (!stored) return initialContractState(from, vehicleId);
  try {
    const state = JSON.parse(stored) as ContractWizardState;
    if (vehicleId && !state.draft.selectedVehicleIds.includes(vehicleId)) {
      state.draft.selectedVehicleIds.push(vehicleId);
    }
    if (from) state.draft.startLocal = `${from}T08:00`;
    return state;
  } catch {
    return initialContractState(from, vehicleId);
  }
}

export function saveContractState(state: ContractWizardState) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearContractState() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function toIso(local: string): string {
  return new Date(local).toISOString();
}
