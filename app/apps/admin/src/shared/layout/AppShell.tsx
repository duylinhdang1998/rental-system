import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { DemoBanner } from './DemoBanner';
import { DesktopNavigation } from './DesktopNavigation';
import { MobileNavigation } from './MobileNavigation';

export function AppShell() {
  return (
    <div className="app-grid bg-app">
      <a className="sr-only focus:not-sr-only" href="#main-content">
        Bỏ qua tới nội dung
      </a>
      <DesktopNavigation />
      <div className="min-w-0">
        <AppHeader />
        <DemoBanner />
        <main
          className="mx-auto max-w-screen-2xl px-4 py-6 pb-20 sm:px-5 lg:px-6 lg:pb-8"
          id="main-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
