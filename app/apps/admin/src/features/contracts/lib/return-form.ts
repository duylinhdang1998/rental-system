import {
  RETURN_PHOTO_LIMITS,
  calculateLateReturnFee,
  type ContractLine,
  type ContractReturnInput,
  type DamageItem,
  type InspectionChargeInput,
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
  damageItemId: string;
  fuelPercent: string;
  notes: string;
  photos: File[];
}

/** Photos travel with the return: uploaded first, then the keys are posted with the input. */
export interface ReturnSubmission {
  input: ContractReturnInput;
  photos: File[];
}

export type PhotoIssue = 'tooLarge' | 'tooMany';

export type ReturnFieldChange = <TField extends keyof ReturnFormValues>(
  field: TField,
  value: ReturnFormValues[TField],
) => void;

/** Picking a catalog item copies its price and name into the form; "free text" clears them. */
export function applyDamageItem(change: ReturnFieldChange, item: DamageItem | null): void {
  change('damageItemId', item?.id ?? '');
  change('chargeAmount', item ? String(item.priceVnd) : '');
  change('chargeDescription', item?.name ?? '');
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
    damageItemId: '',
    fuelPercent: DEFAULT_FUEL,
    notes: '',
    photos: [],
  };
}

function parseAmount(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** US-026: a catalog item is sent by id (the API copies its price); free text needs both fields. */
export function inspectionCharges(form: ReturnFormValues): InspectionChargeInput[] {
  if (form.chargeKind === 'DAMAGE' && form.damageItemId) {
    return [{ damageItemId: form.damageItemId, kind: 'DAMAGE' }];
  }
  const amount = parseAmount(form.chargeAmount);
  if (amount <= 0) return [];
  return [{ amountVnd: amount, description: form.chargeDescription.trim(), kind: form.chargeKind }];
}

export function toReturnInput(
  form: ReturnFormValues,
  imageObjectKeys: string[] = [],
): ContractReturnInput {
  return {
    actualReturnAt: localInputToIso(form.actualLocal),
    charges: inspectionCharges(form),
    condition: form.condition,
    fuelPercent: parseAmount(form.fuelPercent),
    imageObjectKeys,
    notes: form.notes.trim(),
  };
}

export function toReturnSubmission(form: ReturnFormValues): ReturnSubmission {
  return { input: toReturnInput(form), photos: form.photos };
}

/** Mirrors the API limits so an oversized selection is refused before any upload starts. */
export function photoIssue(photos: readonly File[]): PhotoIssue | null {
  if (photos.length > RETURN_PHOTO_LIMITS.maxFiles) return 'tooMany';
  return photos.some((file) => file.size > RETURN_PHOTO_LIMITS.maxBytes) ? 'tooLarge' : null;
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
