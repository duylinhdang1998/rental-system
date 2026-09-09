-- Sprint 4: contract lifecycle, business timeline and linked vehicle swaps.
ALTER TYPE "ContractStatus" ADD VALUE IF NOT EXISTS 'OVERDUE';

CREATE TYPE "ContractEventType" AS ENUM (
  'CREATED',
  'ACTIVATED',
  'EXTENDED',
  'SWAPPED',
  'OVERDUE',
  'CANCELLED',
  'COMPLETED'
);

ALTER TABLE "Contract"
ADD COLUMN "activatedAt" TIMESTAMPTZ,
ADD COLUMN "overdueSince" TIMESTAMPTZ,
ADD COLUMN "completedAt" TIMESTAMPTZ,
ADD COLUMN "cancelledAt" TIMESTAMPTZ,
ADD COLUMN "cancelledById" TEXT,
ADD COLUMN "cancellationReason" TEXT;

CREATE INDEX "Contract_status_idx" ON "Contract"("status");

ALTER TABLE "ContractVehicleLine"
ADD COLUMN "blocksAvailability" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "replacesLineId" TEXT;

CREATE UNIQUE INDEX "ContractVehicleLine_replacesLineId_key" ON "ContractVehicleLine"("replacesLineId");

ALTER TABLE "ContractVehicleLine"
ADD CONSTRAINT "ContractVehicleLine_replacesLineId_fkey"
FOREIGN KEY ("replacesLineId") REFERENCES "ContractVehicleLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Cancelled and completed lines stop blocking the vehicle; the exclusion stays the last line of defense.
ALTER TABLE "ContractVehicleLine" DROP CONSTRAINT "ContractVehicleLine_no_overlap";
ALTER TABLE "ContractVehicleLine"
  ADD CONSTRAINT "ContractVehicleLine_no_overlap"
  EXCLUDE USING gist ("vehicleId" WITH =, tstzrange("startAt", "endAt", '[)') WITH &&)
  WHERE ("blocksAvailability");

CREATE TABLE "ContractEvent" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "type" "ContractEventType" NOT NULL,
  "actorId" TEXT NOT NULL,
  "reason" TEXT,
  "metadata" JSONB,
  "occurredAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContractEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContractEvent_contractId_occurredAt_idx" ON "ContractEvent"("contractId", "occurredAt");

ALTER TABLE "ContractEvent"
ADD CONSTRAINT "ContractEvent_contractId_fkey"
FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill the creation event for contracts that already exist.
INSERT INTO "ContractEvent" ("id", "contractId", "type", "actorId", "occurredAt")
SELECT gen_random_uuid()::text, "id", 'CREATED', "createdById", "createdAt" FROM "Contract";
