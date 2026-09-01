import { useTranslation } from 'react-i18next';
import { FormActions } from '@/shared/ui/FormActions';
import { CustomerFields } from '@/features/customers/components/form/CustomerFields';
import { DuplicateCustomerNotice } from '@/features/customers/components/form/DuplicateCustomerNotice';
import { useCustomerForm } from '@/features/customers/hooks/use-customer-form';

interface CustomerFormProps {
  onClose: () => void;
}

export function CustomerForm({ onClose }: CustomerFormProps) {
  const { t } = useTranslation();
  const form = useCustomerForm(onClose);
  return (
    <form className="grid gap-4" onSubmit={form.submit}>
      {form.create.error ? (
        <p
          className="rounded-control bg-negative-soft p-3 font-semibold text-negative"
          role="alert"
        >
          {form.create.error.message}
        </p>
      ) : null}
      <CustomerFields change={form.change} fields={form.fields} />
      <DuplicateCustomerNotice customers={form.duplicates.data?.items ?? []} />
      <FormActions
        cancelLabel={t('cancel')}
        loading={form.create.isPending}
        onCancel={onClose}
        saveLabel={t('saveCustomer')}
      />
    </form>
  );
}
