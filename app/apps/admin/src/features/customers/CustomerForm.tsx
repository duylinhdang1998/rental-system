import { useTranslation } from 'react-i18next';
import { FormActions } from '../../shared/ui/FormActions';
import { CustomerFields } from './CustomerFields';
import { DuplicateCustomerNotice } from './DuplicateCustomerNotice';
import { useCustomerForm } from './use-customer-form';

interface CustomerFormProps {
  onClose: () => void;
}

export function CustomerForm({ onClose }: CustomerFormProps) {
  const { t } = useTranslation();
  const form = useCustomerForm(onClose);
  return (
    <form className="surface-card grid gap-4 p-5" onSubmit={form.submit}>
      <div>
        <h2 className="text-xl font-extrabold">{t('addCustomer')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('customerFormHelp')}</p>
      </div>
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
