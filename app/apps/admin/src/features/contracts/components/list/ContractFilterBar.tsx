import { contractStatusSchema, type ContractListQuery } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { Field } from '@/components/ui/field';
import { FieldLabel } from '@/components/ui/field-label';
import { Input } from '@/components/ui/input';
import { SelectField } from '@/shared/ui/SelectField';

interface ContractFilterBarProps {
  filters: ContractListQuery;
  update: (key: 'search' | 'status', value: string) => void;
}

export function ContractFilterBar({ filters, update }: ContractFilterBarProps) {
  const { t } = useTranslation();
  const statusOptions = contractStatusSchema.options.map((status) => ({
    label: t(`contractStatus.${status}`),
    value: status,
  }));
  return (
    <div className="surface-card grid gap-3 p-4 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor="contract-search">{t('search')}</FieldLabel>
        <Input
          id="contract-search"
          onChange={(event) => update('search', event.target.value)}
          placeholder={t('contractSearchPlaceholder')}
          type="search"
          value={filters.search ?? ''}
        />
      </Field>
      <SelectField
        id="contract-status"
        label={t('status')}
        onChange={(value) => update('status', value)}
        options={[{ label: t('contractAllStatuses'), value: '' }, ...statusOptions]}
        value={filters.status ?? ''}
      />
    </div>
  );
}
