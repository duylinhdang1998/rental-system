import { TableBody } from '@/components/ui/table-body';
import { TableCell } from '@/components/ui/table-cell';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';

const ROWS = [
  ['Honda Vision', 'Sẵn sàng', '01/09/2026 14:30'],
  ['Yamaha Grande', 'Đang thuê', '31/08/2026 09:15'],
] as const;

export function TableSpecimen() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Xe</TableHead>
          <TableHead>Trạng thái</TableHead>
          <TableHead>CreatedAt</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {ROWS.map(([vehicle, status, createdAt]) => (
          <TableRow key={vehicle}>
            <TableCell className="font-bold">{vehicle}</TableCell>
            <TableCell>{status}</TableCell>
            <TableCell>{createdAt}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
