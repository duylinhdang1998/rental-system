import type { CustomerSummary } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { FieldLabel } from '@/components/ui/field-label';
import { RadioGroupItem } from '@/components/ui/radio-group-item';
import { RadioGroup } from '@/components/ui/radio-group-root';

interface Props {
  customers: CustomerSummary[];
  customerId: string;
  onChange: (id: string) => void;
}

export function CustomerOptions({ customers, customerId, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <fieldset className="grid gap-3">
      <legend className="mb-2 text-lg font-extrabold">{t('contractCustomer')}</legend>
      <RadioGroup onValueChange={onChange} value={customerId}>
        {customers.map((customer) => (
          <FieldLabel
            className={`surface-card flex min-h-touch w-full cursor-pointer items-center gap-3 p-4 ${customerId === customer.id ? 'border-brand bg-brand-soft' : ''}`}
            htmlFor={`customer-${customer.id}`}
            key={customer.id}
          >
            <RadioGroupItem id={`customer-${customer.id}`} value={customer.id} />
            <span>
              <strong>{customer.name}</strong>
              <small className="block text-ink-muted">{customer.contacts[0]?.value}</small>
            </span>
          </FieldLabel>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
