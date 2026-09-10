import { returnQueueSchema, type ReturnQueue } from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchReturnQueue(): Promise<ReturnQueue> {
  return returnQueueSchema.parse(await apiRequest('/api/contracts/returns/queue'));
}
