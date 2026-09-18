import { z } from 'zod';

export const DEFAULT_AUDIT_PAGE_SIZE = 50;
export const MAX_AUDIT_PAGE_SIZE = 200;
const MAX_FILTER_LENGTH = 120;

const auditMetadataValueSchema = z.union([z.boolean(), z.null(), z.number(), z.string()]);

export const auditEventSchema = z.object({
  action: z.string(),
  actorId: z.string(),
  actorName: z.string(),
  at: z.string(),
  entityId: z.string(),
  entityType: z.string(),
  metadata: z.record(z.string(), auditMetadataValueSchema).optional(),
});
export type AuditEventView = z.infer<typeof auditEventSchema>;

export const auditListSchema = z.object({
  count: z.number().int().nonnegative(),
  items: z.array(auditEventSchema),
});
export type AuditList = z.infer<typeof auditListSchema>;

/** Owner-only filters; every field is optional so the default view is "latest changes". */
export const auditQuerySchema = z
  .object({
    action: z.string().trim().max(MAX_FILTER_LENGTH).optional(),
    actorId: z.string().trim().max(MAX_FILTER_LENGTH).optional(),
    entityId: z.string().trim().max(MAX_FILTER_LENGTH).optional(),
    entityType: z.string().trim().max(MAX_FILTER_LENGTH).optional(),
    from: z.iso.date().optional(),
    limit: z.coerce.number().int().min(1).max(MAX_AUDIT_PAGE_SIZE).default(DEFAULT_AUDIT_PAGE_SIZE),
    to: z.iso.date().optional(),
  })
  .strict();
export type AuditQuery = z.infer<typeof auditQuerySchema>;
export type AuditQueryInput = z.input<typeof auditQuerySchema>;
