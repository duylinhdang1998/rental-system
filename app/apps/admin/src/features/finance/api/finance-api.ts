import { receivableListSchema, type ReceivableList } from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchReceivables(): Promise<ReceivableList> {
  return receivableListSchema.parse(await apiRequest('/api/finance/receivables'));
}
