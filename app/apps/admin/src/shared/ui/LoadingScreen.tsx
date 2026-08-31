import { LoaderCircle } from 'lucide-react';

export function LoadingScreen() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-app">
      <LoaderCircle aria-label="Đang tải" className="size-8 animate-spin text-brand" />
    </main>
  );
}
