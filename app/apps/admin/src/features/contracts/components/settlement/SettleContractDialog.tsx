import type { UseMutationResult } from '@tanstack/react-query';
import type { ContractSettleInput, RentalContract, SettlementStatement } from '@rental/contracts';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import { SettleChecklistFields } from '@/features/contracts/components/settlement/SettleChecklistFields';
import { SettleDepositField } from '@/features/contracts/components/settlement/SettleDepositField';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import {
  initialSettleForm,
  previewSettlement,
  settleBlocked,
  toSettleInput,
} from '@/features/contracts/lib/settlement-presentation';

interface SettleContractDialogProps {
  contract: RentalContract;
  mutation: UseMutationResult<RentalContract, Error, ContractSettleInput>;
  onClose: () => void;
  statement: SettlementStatement;
}

const COPY_KEYS = { description: 'settleBody', save: 'settleConfirm', title: 'settle' };

export function SettleContractDialog(props: SettleContractDialogProps) {
  const { contract, mutation, onClose, statement } = props;
  const form = useLifecycleForm(initialSettleForm(statement), toSettleInput, mutation, onClose);
  const preview = previewSettlement(statement, form.form.depositApplied);
  const { retainedDocument } = contract.handover;
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={settleBlocked(form.form, preview, retainedDocument)}
    >
      <SettleDepositField
        onChange={form.change}
        preview={preview}
        value={form.form.depositApplied}
      />
      <SettleChecklistFields
        onChange={form.change}
        preview={preview}
        retainedDocument={retainedDocument}
        values={form.form}
      />
    </LifecycleFormDialog>
  );
}
