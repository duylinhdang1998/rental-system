import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuditLogPage } from '@/features/audit';
import { CashShiftPage } from '@/features/cash-shifts';
import { ContractDetailPage, ContractListPage, ContractWizardPage } from '@/features/contracts';
import { CustomerListPage } from '@/features/customers';
import { OperationsDashboard } from '@/features/dashboard';
import { EmployeeListPage } from '@/features/employees';
import { ExpenseListPage } from '@/features/expenses';
import { ReceivableListPage } from '@/features/finance';
import { VehicleListPage } from '@/features/fleet';
import { AnalyticsPage, FleetEconomicsPage, PnlPage, ReportPage } from '@/features/reporting';
import { ReturnQueuePage } from '@/features/returns';
import { DamageItemsPage, SettingsPage } from '@/features/settings';
import { UiKitPage } from '@/features/ui-kit';
import { AuthenticatedRoute } from '@/routes/AuthenticatedRoute';
import { BusinessProviders } from '@/routes/BusinessProviders';
import { LoginRoute } from '@/routes/LoginRoute';
import { OwnerRoute } from '@/routes/OwnerRoute';
import { AppShell } from '@/shared/layout/AppShell';

/** Pages every signed-in role can open; the Owner-only pages sit behind OwnerRoute below. */
const SHARED_PAGES = [
  { element: <VehicleListPage />, path: 'vehicles' },
  { element: <CustomerListPage />, path: 'customers' },
  { element: <ContractListPage />, path: 'contracts' },
  { element: <ContractWizardPage />, path: 'contracts/new' },
  { element: <ContractDetailPage />, path: 'contracts/:id' },
  { element: <ReturnQueuePage />, path: 'returns' },
  { element: <ReceivableListPage />, path: 'receivables' },
  { element: <ExpenseListPage />, path: 'expenses' },
  { element: <CashShiftPage />, path: 'cash-shifts' },
];
const OWNER_PAGES = [
  { element: <ReportPage />, path: 'reports' },
  { element: <FleetEconomicsPage />, path: 'reports/fleet' },
  { element: <AnalyticsPage />, path: 'reports/analytics' },
  { element: <PnlPage />, path: 'reports/pnl' },
  { element: <EmployeeListPage />, path: 'employees' },
  { element: <AuditLogPage />, path: 'audit' },
  { element: <SettingsPage />, path: 'settings' },
  { element: <DamageItemsPage />, path: 'settings/damage-items' },
];

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {import.meta.env.DEV ? <Route element={<UiKitPage />} path="/ui-kit" /> : null}
        <Route element={<BusinessProviders />}>
          <Route element={<LoginRoute />} path="/login" />
          <Route element={<AuthenticatedRoute />}>
            <Route element={<AppShell />}>
              <Route element={<OperationsDashboard />} index />
              {SHARED_PAGES.map((page) => (
                <Route element={page.element} key={page.path} path={page.path} />
              ))}
              <Route element={<OwnerRoute />}>
                {OWNER_PAGES.map((page) => (
                  <Route element={page.element} key={page.path} path={page.path} />
                ))}
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
