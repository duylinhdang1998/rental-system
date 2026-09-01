import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/shared/ui/LoadingButton';

export function ButtonStates() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold text-ink">Kích thước &amp; trạng thái</h3>
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm">Nhỏ</Button>
        <Button data-testid="ready-save">Lưu dữ liệu</Button>
        <Button size="lg">Lớn</Button>
        <Button disabled>Không khả dụng</Button>
        <LoadingButton data-testid="loading-save" loading>
          Lưu dữ liệu
        </LoadingButton>
        <Button aria-label="Thêm nhanh" size="icon">
          <Plus aria-hidden />
        </Button>
      </div>
    </div>
  );
}
