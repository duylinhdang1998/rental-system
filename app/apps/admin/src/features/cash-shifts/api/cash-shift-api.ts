import {
  cashShiftCurrentSchema,
  cashShiftListSchema,
  cashShiftSchema,
  type CashShift,
  type CashShiftCloseInput,
  type CashShiftCurrent,
  type CashShiftList,
  type CashShiftOpenInput,
} from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchCurrentShift(): Promise<CashShiftCurrent> {
  return cashShiftCurrentSchema.parse(await apiRequest('/api/cash-shifts/current'));
}

export async function fetchCashShifts(): Promise<CashShiftList> {
  return cashShiftListSchema.parse(await apiRequest('/api/cash-shifts'));
}

export async function openCashShift(input: CashShiftOpenInput): Promise<CashShift> {
  return cashShiftSchema.parse(
    await apiRequest('/api/cash-shifts', { body: JSON.stringify(input), method: 'POST' }),
  );
}

export async function closeCashShift(id: string, input: CashShiftCloseInput): Promise<CashShift> {
  return cashShiftSchema.parse(
    await apiRequest(`/api/cash-shifts/${id}/close`, {
      body: JSON.stringify(input),
      method: 'POST',
    }),
  );
}
