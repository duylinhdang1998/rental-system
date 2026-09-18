import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuditLogPage } from '@/features/audit';
import { ContractDetailPage, ContractListPage, ContractWizardPage } from '@/features/contracts';
import { CustomerListPage } from '@/features/customers';
import { OperationsDashboard } from '@/features/dashboard';
import { EmployeeListPage } from '@/features/employees';
import { ReceivableListPage } from '@/features/finance';
import { VehicleListPage } from '@/features/fleet';
import { ReportPage } from '@/features/reporting';
import { ReturnQueuePage } from '@/features/returns';
import { SettingsPage } from '@/features/settings';
import { UiKitPage } from '@/features/ui-kit';
import { AuthenticatedRoute } from '@/routes/AuthenticatedRoute';
import { BusinessProviders } from '@/routes/BusinessProviders';
import { LoginRoute } from '@/routes/LoginRoute';
import { OwnerRoute } from '@/routes/OwnerRoute';
import { AppShell } from '@/shared/layout/AppShell';

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
              <Route element={<VehicleListPage />} path="vehicles" />
              <Route element={<CustomerListPage />} path="customers" />
              <Route element={<ContractListPage />} path="contracts" />
              <Route element={<ContractWizardPage />} path="contracts/new" />
              <Route element={<ContractDetailPage />} path="contracts/:id" />
              <Route element={<ReturnQueuePage />} path="returns" />
              <Route element={<ReceivableListPage />} path="receivables" />
              <Route element={<OwnerRoute />}>
                <Route element={<ReportPage />} path="reports" />
                <Route element={<EmployeeListPage />} path="employees" />
                <Route element={<AuditLogPage />} path="audit" />
                <Route element={<SettingsPage />} path="settings" />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
