import {
  demoDashboardSchema,
  demoPreviewSchema,
  type DemoDashboard,
  type DemoPreview,
  type PreviewModule,
} from '@rental/contracts';

async function fetchJson(path: string): Promise<unknown> {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Không thể tải dữ liệu minh họa');
  return response.json() as Promise<unknown>;
}

export async function fetchDashboard(): Promise<DemoDashboard> {
  return demoDashboardSchema.parse(await fetchJson('/api/demo/dashboard'));
}

export async function fetchPreview(moduleName: PreviewModule): Promise<DemoPreview> {
  return demoPreviewSchema.parse(await fetchJson(`/api/demo/${moduleName}`));
}
