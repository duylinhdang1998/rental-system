import type { CashShiftCurrent } from '@rental/contracts';
import { CurrentShiftDetails } from '@/features/cash-shifts/components/current/CurrentShiftDetails';
import { CurrentShiftEmpty } from '@/features/cash-shifts/components/current/CurrentShiftEmpty';

interface CurrentShiftCardProps {
  current: CashShiftCurrent;
  onCloseShift: () => void;
  onOpenShift: () => void;
}

export function CurrentShiftCard({ current, onCloseShift, onOpenShift }: CurrentShiftCardProps) {
  if (!current.shift || !current.expectation) {
    return <CurrentShiftEmpty onOpenShift={onOpenShift} />;
  }
  return (
    <CurrentShiftDetails
      expectation={current.expectation}
      onCloseShift={onCloseShift}
      shift={current.shift}
    />
  );
}
