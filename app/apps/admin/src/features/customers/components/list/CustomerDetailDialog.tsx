import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { CustomerWarnings } from '@/features/customers/components/list/CustomerWarnings';
import { CustomerContacts } from '@/features/customers/components/list/CustomerContacts';
import { RecordDetailsDialog } from '@/shared/ui/RecordDetailsDialog';
import { formatDateTime, resolveInitialLocale } from '@/shared/i18n/locale';

interface CustomerDetailDialogProps {
  customer: CustomerSummary;
  onClose: () => void;
}

export function CustomerDetailDialog({ customer, onClose }: CustomerDetailDialogProps) {
  const { i18n, t } = useTranslation();
  const details = [
    { label: t('nationality'), value: customer.nationality || '—' },
    {
      label: t('createdAt'),
      value: formatDateTime(customer.createdAt, resolveInitialLocale(i18n.language)),
    },
    {
      label: t('customerContacts'),
      value: customer.contacts.length ? (
        <CustomerContacts contacts={customer.contacts} />
      ) : (
        t('noContact')
      ),
    },
  ];
  return (
    <RecordDetailsDialog
      title={customer.name}
      description={t('customerDetails')}
      details={details}
      onClose={onClose}
    >
      <CustomerWarnings customers={[customer]} />
    </RecordDetailsDialog>
  );
}
