import { operationsBoardSchema, type OperationsBoard } from '@rental/contracts';
import { apiRequest } from '@/shared/api/http';

export async function fetchOperationsBoard(): Promise<OperationsBoard> {
  return operationsBoardSchema.parse(await apiRequest('/api/contracts/board'));
}
