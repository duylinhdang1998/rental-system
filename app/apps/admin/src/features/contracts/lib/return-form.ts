import {
  calculateLateReturnFee,
  type ContractLine,
  type ContractReturnInput,
  type InspectionChargeKind,
  type LateReturnFee,
  type LateReturnPolicy,
  type ReturnCondition,
} from '@rental/contracts';
import { localInputToIso, toLocalInput } from '@/features/contracts/lib/contract-presentation';

/** What the return dialog needs to know about a line, from either the detail page or the queue. */
export interface ReturnTarget {
  endAt: string;
  id: string;
  lateReturnPolicy: LateReturnPolicy;
  vehicleCode: string;
}

export interface ReturnFormValues {
  actualLocal: string;
  chargeAmount: string;
  chargeDescription: string;
  chargeKind: InspectionChargeKind;
  condition: ReturnCondition;
  fuelPercent: string;
  notes: string;
}

export const RETURN_CONDITIONS: ReturnCondition[] = ['GOOD', 'MAINTENANCE', 'DAMAGED'];
export const INSPECTION_CHARGE_KINDS: InspectionChargeKind[] = ['DAMAGE', 'OTHER'];
const DEFAULT_FUEL = '50';

export function returnTargetFromLine(line: ContractLine): ReturnTarget {
  return {
    endAt: line.endAt,
    id: line.id,
    lateReturnPolicy: line.lateReturnPolicy,
    vehicleCode: line.vehicleCode,
  };
}

export function initialReturnForm(now = new Date()): ReturnFormValues {
  return {
    actualLocal: toLocalInput(now.toISOString()),
    chargeAmount: '',
    chargeDescription: '',
    chargeKind: 'DAMAGE',
    condition: 'GOOD',
    fuelPercent: DEFAULT_FUEL,
    notes: '',
  };
}

function parseAmount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function toReturnInput(form: ReturnFormValues): ContractReturnInput {
  const amount = parseAmount(form.chargeAmount);
  return {
    actualReturnAt: localInputToIso(form.actualLocal),
    charges:
      amount > 0
        ? [{ amountVnd: amount, description: form.chargeDescription.trim(), kind: form.chargeKind }]
        : [],
    condition: form.condition,
    fuelPercent: parseAmount(form.fuelPercent),
    imageObjectKeys: [],
    notes: form.notes.trim(),
  };
}

/** Client-side preview using the same shared formula the API snapshots (no drift). */
export function lateFeePreview(target: ReturnTarget, actualLocal: string): LateReturnFee | null {
  const actual = Date.parse(actualLocal);
  if (Number.isNaN(actual)) return null;
  return calculateLateReturnFee(
    target.endAt,
    new Date(actual).toISOString(),
    target.lateReturnPolicy,
  );
}
