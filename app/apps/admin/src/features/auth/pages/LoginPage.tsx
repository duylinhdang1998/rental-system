import { Bike } from 'lucide-react';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { LoginHero } from '@/features/auth/components/LoginHero';

export function LoginPage() {
  return (
    <main className="grid min-h-screen bg-app lg:grid-cols-2">
      <LoginHero />
      <section className="flex items-center justify-center p-4 sm:p-8">
        <div className="surface-card w-full max-w-md rounded-panel p-6 sm:p-8">
          <div className="mb-8 flex items-center gap-2 text-lg font-extrabold text-brand lg:hidden">
            <Bike aria-hidden /> MotoRental
          </div>
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-brand">
            Không gian vận hành
          </p>
          <h1 className="text-3xl font-extrabold text-ink">Chào mừng trở lại</h1>
          <p className="mb-8 mt-2 text-ink-muted">Đăng nhập để quản lý cửa hàng</p>
          <LoginForm />
          <div className="mt-6 rounded-card bg-caution-soft p-4 text-sm text-caution">
            <p className="font-extrabold">Dữ liệu minh họa</p>
            <p className="mt-1">Chủ: owner · Nhân viên: staff</p>
          </div>
        </div>
      </section>
    </main>
  );
}
