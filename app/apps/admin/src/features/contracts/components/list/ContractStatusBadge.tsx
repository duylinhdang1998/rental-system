import type { ContractStatus } from '@rental/contracts';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { contractStatusTone } from '@/features/contracts/lib/contract-presentation';

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const { t } = useTranslation();
  return <StatusBadge label={t(`contractStatus.${status}`)} tone={contractStatusTone(status)} />;
}
