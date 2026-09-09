import type { UseMutationResult } from '@tanstack/react-query';
import type { ContractSwapInput, RentalContract } from '@rental/contracts';
import { LifecycleFormDialog } from '@/features/contracts/components/lifecycle/LifecycleFormDialog';
import {
  SwapVehicleFields,
  type SwapFormValues,
} from '@/features/contracts/components/lifecycle/SwapVehicleFields';
import { useLifecycleForm } from '@/features/contracts/hooks/use-lifecycle-form';
import { useSwapCandidates } from '@/features/contracts/hooks/use-swap-candidates';
import { activeContractLines } from '@/features/contracts/lib/contract-presentation';

interface SwapVehicleDialogProps {
  contract: RentalContract;
  mutation: UseMutationResult<RentalContract, Error, ContractSwapInput>;
  onClose: () => void;
}

const COPY_KEYS = {
  description: 'contractSwapBody',
  save: 'contractSwapConfirm',
  title: 'contractSwap',
};

function toInput(form: SwapFormValues): ContractSwapInput {
  return {
    lineId: form.lineId,
    reason: form.reason.trim(),
    replacementVehicleId: form.replacementVehicleId,
  };
}

export function SwapVehicleDialog({ contract, mutation, onClose }: SwapVehicleDialogProps) {
  const lines = activeContractLines(contract.quote.lines);
  const form = useLifecycleForm(
    { lineId: lines[0]?.id ?? '', reason: '', replacementVehicleId: '' },
    toInput,
    mutation,
    onClose,
  );
  const candidates = useSwapCandidates(lines.find((item) => item.id === form.form.lineId));
  return (
    <LifecycleFormDialog
      copyKeys={COPY_KEYS}
      mutation={mutation}
      onClose={onClose}
      onSubmit={form.submit}
      submitDisabled={!form.form.replacementVehicleId}
    >
      <SwapVehicleFields
        candidates={candidates}
        lines={lines}
        onChange={form.change}
        values={form.form}
      />
    </LifecycleFormDialog>
  );
}
