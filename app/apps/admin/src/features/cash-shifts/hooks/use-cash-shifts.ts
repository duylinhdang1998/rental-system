import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import type {
  CashShift,
  CashShiftCloseInput,
  CashShiftCurrent,
  CashShiftList,
  CashShiftOpenInput,
} from '@rental/contracts';
import {
  closeCashShift,
  fetchCashShifts,
  fetchCurrentShift,
  openCashShift,
} from '@/features/cash-shifts/api/cash-shift-api';

const CURRENT_REFRESH_MS = 30_000;
const CASH_SHIFT_KEY = ['cash-shift'];

export function useCurrentCashShift(): UseQueryResult<CashShiftCurrent, Error> {
  return useQuery({
    queryFn: fetchCurrentShift,
    queryKey: ['cash-shift', 'current'],
    refetchInterval: CURRENT_REFRESH_MS,
  });
}

export function useCashShiftHistory(): UseQueryResult<CashShiftList, Error> {
  return useQuery({ queryFn: fetchCashShifts, queryKey: ['cash-shift', 'list'] });
}

function useCashShiftInvalidation() {
  const queryClient = useQueryClient();
  return async () => {
    await queryClient.invalidateQueries({ queryKey: CASH_SHIFT_KEY });
  };
}

export function useOpenCashShift() {
  const invalidate = useCashShiftInvalidation();
  return useMutation<CashShift, Error, CashShiftOpenInput>({
    mutationFn: openCashShift,
    onSuccess: invalidate,
  });
}

export function useCloseCashShift(id: string) {
  const invalidate = useCashShiftInvalidation();
  return useMutation<CashShift, Error, CashShiftCloseInput>({
    mutationFn: (input) => closeCashShift(id, input),
    onSuccess: invalidate,
  });
}
