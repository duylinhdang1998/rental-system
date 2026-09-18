import type { Prisma } from '@prisma/client';
import type { ContractListQuery } from '@rental/contracts';
import type { ContractDraft } from './contract.types.js';
import { lineData } from './prisma-contract.mapper.js';

/** Status filter plus a case-insensitive search across code, customer snapshot and vehicle code. */
export function contractListWhere(query: ContractListQuery): Prisma.ContractWhereInput {
  const search = query.search?.trim();
  return {
    ...(query.status ? { status: query.status } : {}),
    ...(search
      ? {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { customerNameSnapshot: { contains: search, mode: 'insensitive' } },
            { lines: { some: { vehicle: { code: { contains: search, mode: 'insensitive' } } } } },
          ],
        }
      : {}),
  };
}

export function contractCreateData(draft: ContractDraft): Prisma.ContractUncheckedCreateInput {
  return {
    code: draft.code,
    createdById: draft.actorId,
    customerId: draft.customerId,
    customerNameSnapshot: draft.quote.customerName,
    deliveryFeeVnd: draft.quote.deliveryFeeVnd,
    events: { create: { actorId: draft.actorId, occurredAt: new Date(), type: 'CREATED' } },
    handover: { create: draft.handover },
    idempotencyKey: draft.idempotencyKey,
    lines: { create: draft.quote.lines.map((line) => lineData(line, draft.quote)) },
    totalVnd: draft.quote.totalVnd,
  };
}
