import { FlaskConical } from 'lucide-react';
import { StatusBadge } from '@/shared/ui/StatusBadge';

export function UiKitHeader() {
  return (
    <header className="border-b border-line bg-panel">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-control bg-brand-soft text-brand">
            <FlaskConical aria-hidden className="size-5" />
          </span>
          <StatusBadge label="Bản nháp để duyệt" tone="info" />
        </div>
        <div>
          <h1 className="type-h1 tracking-tight text-ink">UI Foundation</h1>
          <p className="mt-3 max-w-3xl text-base leading-7 text-ink-muted">
            Không gian duyệt component nền tảng của hệ thống. Mỗi thay đổi sẽ được chốt tại đây
            trước khi áp dụng đồng bộ vào các màn hình nghiệp vụ.
          </p>
        </div>
      </div>
    </header>
  );
}
