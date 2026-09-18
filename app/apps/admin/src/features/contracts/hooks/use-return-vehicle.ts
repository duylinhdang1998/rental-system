import { returnVehicle, uploadReturnPhotos } from '@/features/contracts/api/contracts-api';
import { useContractMutation } from '@/features/contracts/hooks/use-contract-mutation';
import type { ReturnSubmission } from '@/features/contracts/lib/return-form';

/** Photos upload first (one request); a refused upload leaves the vehicle out and the dialog open. */
export function useReturnVehicle(contractId: string, lineId: string) {
  return useContractMutation<ReturnSubmission>(contractId, async (id, submission) => {
    const imageObjectKeys = submission.photos.length
      ? (await uploadReturnPhotos(id, submission.photos)).objectKeys
      : [];
    return returnVehicle(id, lineId, { ...submission.input, imageObjectKeys });
  });
}
