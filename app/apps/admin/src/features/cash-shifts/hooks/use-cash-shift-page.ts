import { useState } from 'react';
import {
  useCashShiftHistory,
  useCurrentCashShift,
} from '@/features/cash-shifts/hooks/use-cash-shifts';

export type CashShiftDialogKind = 'close' | 'open' | null;

/** Loads both queries the page needs and tracks which lifecycle dialog is open. */
export function useCashShiftPage() {
  const [dialog, setDialog] = useState<CashShiftDialogKind>(null);
  const current = useCurrentCashShift();
  const history = useCashShiftHistory();
  return {
    closeDialog: () => setDialog(null),
    current,
    dialog,
    history,
    openCloseDialog: () => setDialog('close'),
    openOpenDialog: () => setDialog('open'),
  };
}
