import { z } from 'zod';

export const PREVIEW_SPRINTS = {
  contracts: 3,
  customers: 2,
  employees: 6,
  reports: 5,
  returns: 4,
  settings: 6,
  vehicles: 2,
} as const;

export type PreviewModule = keyof typeof PREVIEW_SPRINTS;

export const demoPreviewSchema = z.object({
  message: z.string(),
  records: z.number().int().nonnegative(),
  sprint: z.number().int().positive(),
});
export type DemoPreview = z.infer<typeof demoPreviewSchema>;

export const demoDashboardSchema = z.object({
  activeRentals: z.number().int().nonnegative(),
  availableVehicles: z.number().int().nonnegative(),
  dueToday: z.number().int().nonnegative(),
  overdue: z.number().int().nonnegative(),
  revenueMonth: z.number().int().nonnegative(),
});
export type DemoDashboard = z.infer<typeof demoDashboardSchema>;
