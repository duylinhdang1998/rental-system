import {
  businessDayKey,
  depreciationAt,
  type VehicleAcquisition,
  type VehicleAcquisitionInput,
} from '@rental/contracts';
import { formatCurrency, type Locale } from '@/shared/i18n/locale';

export interface AcquisitionFormValues {
  purchasePrice: string;
  purchasedOn: string;
  salvageValue: string;
  usefulLifeMonths: string;
}

export type AcquisitionFieldChange = <TField extends keyof AcquisitionFormValues>(
  field: TField,
  value: AcquisitionFormValues[TField],
) => void;

export type AcquisitionIssue = 'incomplete' | 'salvage' | null;

export interface PreviewRow {
  key: string;
  value: string;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_LIFE_MONTHS = 240;
const DEFAULT_LIFE_MONTHS = 36;

export const INITIAL_ACQUISITION_FORM: AcquisitionFormValues = {
  purchasePrice: '',
  purchasedOn: '',
  salvageValue: '0',
  usefulLifeMonths: String(DEFAULT_LIFE_MONTHS),
};

/** The dialog opens on the stored cost when there is one, so an edit never starts blank. */
export function acquisitionFormFrom(acquisition: VehicleAcquisition | null): AcquisitionFormValues {
  if (!acquisition) return INITIAL_ACQUISITION_FORM;
  return {
    purchasePrice: String(acquisition.purchasePriceVnd),
    purchasedOn: acquisition.purchasedOn,
    salvageValue: String(acquisition.salvageValueVnd),
    usefulLifeMonths: String(acquisition.usefulLifeMonths),
  };
}

function parseInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? -1 : parsed;
}

export function toAcquisitionInput(form: AcquisitionFormValues): VehicleAcquisitionInput {
  return {
    purchasePriceVnd: parseInteger(form.purchasePrice),
    purchasedOn: form.purchasedOn,
    salvageValueVnd: parseInteger(form.salvageValue),
    usefulLifeMonths: parseInteger(form.usefulLifeMonths),
  };
}

/** Mirrors vehicleAcquisitionInputSchema: the salvage rule gets its own message (BR-10). */
export function acquisitionIssue(form: AcquisitionFormValues): AcquisitionIssue {
  const input = toAcquisitionInput(form);
  const lifeValid = input.usefulLifeMonths >= 1 && input.usefulLifeMonths <= MAX_LIFE_MONTHS;
  if (input.purchasePriceVnd < 0 || input.salvageValueVnd < 0 || !lifeValid) return 'incomplete';
  if (!DATE_PATTERN.test(form.purchasedOn)) return 'incomplete';
  return input.salvageValueVnd > input.purchasePriceVnd ? 'salvage' : null;
}

/** The same arithmetic the report uses, so the preview never disagrees with the fleet page. */
export function acquisitionPreview(
  form: AcquisitionFormValues,
  now: Date,
  locale: Locale,
): PreviewRow[] | null {
  if (acquisitionIssue(form) !== null) return null;
  const depreciation = depreciationAt(toAcquisitionInput(form), businessDayKey(now));
  return [
    { key: 'monthly', value: formatCurrency(depreciation.monthlyDepreciationVnd, locale) },
    {
      key: 'accumulated',
      value: formatCurrency(depreciation.accumulatedDepreciationVnd, locale),
    },
    { key: 'bookValue', value: formatCurrency(depreciation.bookValueVnd, locale) },
    { key: 'months', value: String(depreciation.monthsElapsed) },
  ];
}
