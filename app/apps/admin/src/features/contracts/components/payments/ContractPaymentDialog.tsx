import { PaymentDialog } from '@/features/contracts/components/payments/PaymentDialog';
import { useRecordPayment } from '@/features/contracts/hooks/use-record-payment';
import type { PaymentCaps } from '@/features/contracts/lib/payment-presentation';

interface ContractPaymentDialogProps {
  balance: PaymentCaps;
  contractId: string;
  onClose: () => void;
}

/** Self-contained variant for lists (receivables) that do not hold the contract mutations. */
export function ContractPaymentDialog({
  balance,
  contractId,
  onClose,
}: ContractPaymentDialogProps) {
  const mutation = useRecordPayment(contractId);
  return <PaymentDialog balance={balance} mutation={mutation} onClose={onClose} />;
}
