import type { UseMutationResult } from '@tanstack/react-query';
import type { DepositRefundInput, RentalContract } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { DepositRefundFields } from '@/features/contracts/components/settlement/DepositRefundFields';
import { useDepositRefundForm } from '@/features/contracts/hooks/use-deposit-refund-form';
import { formatCurrency, resolveInitialLocale } from '@/shared/i18n/locale';

interface DepositRefundDialogProps {
  contract: RentalContract;
  mutation: UseMutationResult<RentalContract, Error, DepositRefundInput>;
  onClose: () => void;
}

const COPY_KEYS = {
  description: 'depositRefundBody',
  save: 'depositRefundConfirm',
  title: 'depositRefund',
};

/** US-028: the amount is the frozen refund figure; the dialog only records how it was paid. */
export function DepositRefundDialog({ contract, mutation, onClose }: DepositRefundDialogProps) {
  const { i18n, t } = useTranslation();
  const form = useDepositRefundForm(mutation, onClose);
  const amount = formatCurrency(
    contract.settlement?.refundVnd ?? 0,
    resolveInitialLocale(i18n.language),
  );
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
    >
      <p className="font-semibold text-ink" data-deposit-refund-amount>
        {t('depositRefundAmount', { amount })}
      </p>
      <DepositRefundFields onChange={form.change} values={form.form} />
    </LifecycleFormDialog>
  );
}
