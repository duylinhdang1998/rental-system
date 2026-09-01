import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ContractWizardPage } from '@/features/contracts';
import { CustomerListPage } from '@/features/customers';
import { OperationsDashboard } from '@/features/dashboard';
import { EmployeePreview } from '@/features/employees';
import { VehicleListPage } from '@/features/fleet';
import { ReportPreview } from '@/features/reporting';
import { ReturnQueuePreview } from '@/features/returns';
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
              <Route element={<ContractWizardPage />} path="contracts" />
              <Route element={<ReturnQueuePreview />} path="returns" />
              <Route element={<OwnerRoute />}>
                <Route element={<ReportPreview />} path="reports" />
                <Route element={<EmployeePreview />} path="employees" />
                <Route element={<SettingsPage />} path="settings" />
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
