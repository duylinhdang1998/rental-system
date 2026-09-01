import { ViewState } from '@/shared/ui/ViewState';

export function FeedbackShowcase() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <ViewState heading="section" state="loading" />
      <ViewState heading="section" state="empty" />
      <ViewState heading="section" state="error" />
    </div>
  );
}
