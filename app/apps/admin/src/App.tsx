import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { SessionProvider } from './features/auth';
import { ContractPreview } from './features/contracts';
import { CustomerPreview } from './features/customers';
import { OperationsDashboard } from './features/dashboard';
import { EmployeePreview } from './features/employees';
import { VehiclePreview } from './features/fleet';
import { ReportPreview } from './features/reporting';
import { ReturnQueuePreview } from './features/returns';
import { SettingsPreview } from './features/settings';
import { AuthenticatedRoute } from './routes/AuthenticatedRoute';
import { LoginRoute } from './routes/LoginRoute';
import { OwnerRoute } from './routes/OwnerRoute';
import { AppShell } from './shared/layout/AppShell';
import { QueryProvider } from './shared/query/QueryProvider';

export function App() {
  return (
    <QueryProvider>
      <SessionProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<LoginRoute />} path="/login" />
            <Route element={<AuthenticatedRoute />}>
              <Route element={<AppShell />}>
                <Route element={<OperationsDashboard />} index />
                <Route element={<VehiclePreview />} path="vehicles" />
                <Route element={<CustomerPreview />} path="customers" />
                <Route element={<ContractPreview />} path="contracts" />
                <Route element={<ReturnQueuePreview />} path="returns" />
                <Route element={<OwnerRoute />}>
                  <Route element={<ReportPreview />} path="reports" />
                  <Route element={<EmployeePreview />} path="employees" />
                  <Route element={<SettingsPreview />} path="settings" />
                </Route>
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SessionProvider>
    </QueryProvider>
  );
}
