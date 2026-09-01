import { StatusBadge } from '@/shared/ui/StatusBadge';

export function StatusSpecimen() {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusBadge label="Sẵn sàng" tone="success" />
      <StatusBadge label="Đang thuê" tone="info" />
      <StatusBadge label="Sắp đến hạn" tone="warning" />
      <StatusBadge label="Quá hạn" tone="danger" />
    </div>
  );
}
