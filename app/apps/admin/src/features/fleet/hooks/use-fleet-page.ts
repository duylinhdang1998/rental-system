import { useStableSearchParams } from '@/shared/hooks/use-stable-search-params';
import { vehicleStatusSchema, type VehicleStatus } from '@rental/contracts';
import { useFleetDialogs } from '@/features/fleet/hooks/use-fleet-dialogs';
import { useFleet } from '@/features/fleet/hooks/use-fleet';

function parsedStatus(value: string | null): VehicleStatus | undefined {
  const parsed = vehicleStatusSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

export function useFleetPage() {
  const [params, setParams] = useStableSearchParams();
  const dialogs = useFleetDialogs();
  const filters = {
    search: params.get('search') ?? undefined,
    status: parsedStatus(params.get('status')),
    typeCode: params.get('typeCode') ?? undefined,
  };
  const fleet = useFleet(filters);
  const update = (key: string, value: string) =>
    setParams((current) => {
      if (value) current.set(key, value);
      else current.delete(key);
      return current;
    });
  return { dialogs, filters, fleet, update };
}
