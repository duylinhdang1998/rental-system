import { useTranslation } from 'react-i18next';
import { EmployeeFields } from '@/features/employees/components/form/EmployeeFields';
import { useEmployeeForm } from '@/features/employees/hooks/use-employee-form';
import { FormActions } from '@/shared/ui/FormActions';

interface EmployeeCreateFormProps {
  onClose: () => void;
}

export function EmployeeCreateForm({ onClose }: EmployeeCreateFormProps) {
  const { t } = useTranslation();
  const form = useEmployeeForm(onClose);
  return (
    <form className="grid gap-5" noValidate onSubmit={form.submit}>
      <EmployeeFields form={form} />
      {form.create.isError ? (
        <p className="text-sm font-semibold text-negative" role="alert">
          {form.create.error.message}
        </p>
      ) : null}
      <FormActions
        cancelLabel={t('cancel')}
        loading={form.create.isPending}
        onCancel={onClose}
        saveLabel={t('employeeSave')}
      />
    </form>
  );
}
