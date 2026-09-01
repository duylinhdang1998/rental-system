import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { TableBody } from '@/components/ui/table-body';
import { TableHead } from '@/components/ui/table-head';
import { TableHeader } from '@/components/ui/table-header';
import { Table } from '@/components/ui/table-root';
import { TableRow } from '@/components/ui/table-row';
import { CustomerTableRow } from './CustomerTableRow';

export function CustomerTable({ customers }: { customers: CustomerSummary[] }) {
  const { t } = useTranslation();
  return (
    <div className="surface-card hidden overflow-hidden sm:block">
      <Table>
        <TableHeader className="bg-panel-subtle text-sm text-ink-muted">
          <TableRow>
            <TableHead>{t('customerName')}</TableHead>
            <TableHead>{t('phone')}</TableHead>
            <TableHead>{t('nationality')}</TableHead>
            <TableHead>{t('createdAt')}</TableHead>
            <TableHead className="text-right">{t('viewDetails')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <CustomerTableRow customer={customer} key={customer.id} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
