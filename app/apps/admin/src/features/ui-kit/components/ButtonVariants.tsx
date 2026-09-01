import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ButtonVariants() {
  return (
    <div>
      <h3 className="mb-3 text-sm font-extrabold text-ink">Variants</h3>
      <div className="flex flex-wrap items-center gap-3">
        <Button>
          <Plus aria-hidden data-icon="inline-start" />
          Thêm mới
        </Button>
        <Button variant="secondary">Lưu nháp</Button>
        <Button variant="outline">Hủy</Button>
        <Button variant="ghost">Xem chi tiết</Button>
        <Button variant="destructive">
          <Trash2 aria-hidden data-icon="inline-start" />
          Xóa
        </Button>
        <Button variant="link">
          Mở hướng dẫn
          <ArrowRight aria-hidden data-icon="inline-end" />
        </Button>
      </div>
    </div>
  );
}
