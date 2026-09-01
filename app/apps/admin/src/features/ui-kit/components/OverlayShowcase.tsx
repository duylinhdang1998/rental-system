import { Button } from '@/components/ui/button';
import { DialogContent } from '@/components/ui/dialog-content';
import { DialogDescription } from '@/components/ui/dialog-description';
import { DialogHeader } from '@/components/ui/dialog-header';
import { DialogTitle } from '@/components/ui/dialog-title';
import { DialogTrigger } from '@/components/ui/dialog-trigger';
import { Dialog } from '@/components/ui/dialog';

export function OverlayShowcase() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Dialog>
        <DialogTrigger asChild>
          <Button>Mở dialog mẫu</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dialog mẫu</DialogTitle>
            <DialogDescription>
              Dùng cho tác vụ cần tập trung, có tiêu đề rõ ràng và trả focus về nút mở khi đóng.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-control bg-panel-subtle p-4 text-sm leading-6 text-ink-muted">
            Nội dung biểu mẫu hoặc xác nhận sẽ nằm trong vùng này.
          </div>
        </DialogContent>
      </Dialog>
      <p className="text-sm text-ink-muted">Có thể đóng bằng phím Escape hoặc nút đóng.</p>
    </div>
  );
}
