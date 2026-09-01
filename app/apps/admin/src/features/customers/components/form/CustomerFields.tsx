import { useTranslation } from 'react-i18next';
import { TextField } from '@/shared/ui/TextField';

interface CustomerFieldsProps {
  change: (field: 'email' | 'name' | 'nationality' | 'phone', value: string) => void;
  fields: { email: string; name: string; nationality: string; phone: string };
}

const CUSTOMER_FIELDS = [
  { field: 'name', id: 'customer-name', label: 'customerName', required: true },
  { field: 'nationality', id: 'customer-nationality', label: 'nationality', required: true },
  { field: 'phone', id: 'customer-phone', label: 'phone', required: true, type: 'tel' },
  { field: 'email', id: 'customer-email', label: 'email', required: false, type: 'email' },
] as const;

export function CustomerFields({ change, fields }: CustomerFieldsProps) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {CUSTOMER_FIELDS.map((field) => (
        <TextField
          data-dialog-autofocus={field.field === 'name' ? '' : undefined}
          id={field.id}
          key={field.id}
          label={t(field.label)}
          onChange={(event) => change(field.field, event.target.value)}
          required={field.required}
          type={'type' in field ? field.type : undefined}
          value={fields[field.field]}
        />
      ))}
    </div>
  );
}
