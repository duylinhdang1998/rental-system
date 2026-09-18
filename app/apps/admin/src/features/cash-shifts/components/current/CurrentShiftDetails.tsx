import type { CashShift, CashShiftExpectation } from '@rental/contracts';
import { CurrentShiftFigure } from '@/features/cash-shifts/components/current/CurrentShiftFigure';
import { CurrentShiftSummary } from '@/features/cash-shifts/components/current/CurrentShiftSummary';
import { MovementChips } from '@/features/cash-shifts/components/current/MovementChips';

interface CurrentShiftDetailsProps {
  expectation: CashShiftExpectation;
  onCloseShift: () => void;
  shift: CashShift;
}

export function CurrentShiftDetails({
  expectation,
  onCloseShift,
  shift,
}: CurrentShiftDetailsProps) {
  return (
    <section className="surface-card grid gap-4 p-5" data-cash-shift-current>
      <CurrentShiftSummary onCloseShift={onCloseShift} shift={shift} />
      <MovementChips expectation={expectation} />
      <CurrentShiftFigure expectation={expectation} />
    </section>
  );
}
