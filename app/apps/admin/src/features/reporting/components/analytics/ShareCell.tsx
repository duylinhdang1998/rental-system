import { Progress } from '@/components/ui/progress';
import { TableCell } from '@/components/ui/table-cell';

interface ShareCellProps {
  label: string;
  percent: number;
}

const PERCENT = 100;

/** A small bar next to the number; the bar is decorative, the percentage is the content. */
export function ShareCell({ label, percent }: ShareCellProps) {
  return (
    <TableCell className="min-w-32">
      <span className="flex items-center gap-2 tabular-nums">
        <Progress aria-label={label} className="w-16" max={PERCENT} value={percent} />
        {percent}%
      </span>
    </TableCell>
  );
}
