import { FoundationColors } from '@/features/ui-kit/components/FoundationColors';
import { FoundationTypography } from '@/features/ui-kit/components/FoundationTypography';

export function FoundationShowcase() {
  return (
    <div className="grid gap-8 xl:grid-cols-2">
      <FoundationColors />
      <FoundationTypography />
    </div>
  );
}
