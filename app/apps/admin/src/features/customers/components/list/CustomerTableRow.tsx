import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table-cell';
import { TableRow } from '@/components/ui/table-row';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

export function CustomerTableRow({ customer }: { customer: CustomerSummary }) {
  const { i18n, t } = useTranslation();
  const phone = customer.contacts.find((contact) => contact.type === 'PHONE')?.value ?? '—';
  return (
    <TableRow>
      <TableCell className="font-bold">{customer.name}</TableCell>
      <TableCell>{phone}</TableCell>
      <TableCell>{customer.nationality}</TableCell>
      <TableCell>
        {formatDateTime(customer.createdAt, resolveInitialLocale(i18n.language))}
      </TableCell>
      <TableCell className="text-right">
        <Button size="sm" type="button" variant="outline">
          {t('viewCustomer')}
        </Button>
      </TableCell>
    </TableRow>
  );
}
