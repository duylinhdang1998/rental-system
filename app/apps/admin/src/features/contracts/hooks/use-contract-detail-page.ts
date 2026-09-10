import { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ContractLine } from '@rental/contracts';
import { useSession } from '@/features/auth/hooks/use-session';
import { useContract } from '@/features/contracts/hooks/use-contracts';
import { useContractMutations } from '@/features/contracts/hooks/use-contract-mutations';
import { useSettlement } from '@/features/contracts/hooks/use-settlement';
import {
  isRentingStatus,
  showsSettlement,
  type ContractAction,
} from '@/features/contracts/lib/contract-presentation';
import { returnTargetFromLine, type ReturnTarget } from '@/features/contracts/lib/return-form';

export type DetailDialog = { kind: ContractAction } | { kind: 'return'; target: ReturnTarget };

export function useContractDetailPage() {
  const { id = '' } = useParams();
  const { user } = useSession();
  const contract = useContract(id);
  const status = contract.data?.status;
  const settlement = useSettlement(id, status !== undefined && showsSettlement(status));
  const [dialog, setDialog] = useState<DetailDialog | null>(null);
  const mutations = useContractMutations(id);
  const closeDialog = () => {
    Object.values(mutations).forEach((mutation) => mutation.reset());
    setDialog(null);
  };
  return {
    closeDialog,
    contract,
    dialog,
    isOwner: user?.role === 'OWNER',
    mutations,
    openDialog: (kind: ContractAction) => setDialog({ kind }),
    openReturn: (line: ContractLine) =>
      setDialog({ kind: 'return', target: returnTargetFromLine(line) }),
    renting: status !== undefined && isRentingStatus(status),
    settlement,
  };
}
