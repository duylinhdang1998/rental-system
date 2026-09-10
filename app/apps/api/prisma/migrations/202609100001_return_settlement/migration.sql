-- Sprint 5: per-vehicle returns, charges and settlement.
ALTER TYPE "ContractEventType" ADD VALUE IF NOT EXISTS 'LINE_RETURNED';
ALTER TYPE "ContractEventType" ADD VALUE IF NOT EXISTS 'CHARGE_ADDED';
ALTER TYPE "ContractEventType" ADD VALUE IF NOT EXISTS 'SETTLED';

CREATE TYPE "ReturnCondition" AS ENUM ('GOOD', 'MAINTENANCE', 'DAMAGED');
CREATE TYPE "ChargeKind" AS ENUM ('LATE_RETURN', 'DAMAGE', 'OTHER', 'DISCOUNT');

ALTER TABLE "Contract" ADD COLUMN "settledAt" TIMESTAMPTZ;

-- Inspection is stored on the line so a returned vehicle stops blocking availability on its own.
ALTER TABLE "ContractVehicleLine"
ADD COLUMN "returnedAt" TIMESTAMPTZ,
ADD COLUMN "returnedById" TEXT,
ADD COLUMN "returnCondition" "ReturnCondition",
ADD COLUMN "returnFuelPercent" INTEGER,
ADD COLUMN "returnNotes" TEXT,
ADD COLUMN "returnImageObjectKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

-- Charges are append-only: no UPDATE/DELETE path exists in the API (BR-07).
CREATE TABLE "ContractCharge" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "lineId" TEXT,
  "vehicleCode" TEXT,
  "kind" "ChargeKind" NOT NULL,
  "amountVnd" INTEGER NOT NULL,
  "description" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContractCharge_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContractCharge_amountVnd_check" CHECK ("amountVnd" >= 0)
);

CREATE INDEX "ContractCharge_contractId_createdAt_idx" ON "ContractCharge"("contractId", "createdAt");

ALTER TABLE "ContractCharge"
ADD CONSTRAINT "ContractCharge_contractId_fkey"
FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ContractCharge"
ADD CONSTRAINT "ContractCharge_lineId_fkey"
FOREIGN KEY ("lineId") REFERENCES "ContractVehicleLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- One immutable settlement snapshot per contract (BR-04 explicit signs).
CREATE TABLE "ContractSettlement" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "settledById" TEXT NOT NULL,
  "settledAt" TIMESTAMPTZ NOT NULL,
  "chargesVnd" INTEGER NOT NULL,
  "discountsVnd" INTEGER NOT NULL,
  "totalDueVnd" INTEGER NOT NULL,
  "paidVnd" INTEGER NOT NULL,
  "outstandingVnd" INTEGER NOT NULL,
  "depositVnd" INTEGER NOT NULL,
  "depositAppliedVnd" INTEGER NOT NULL,
  "refundVnd" INTEGER NOT NULL,
  "receivableVnd" INTEGER NOT NULL,
  "documentReturned" BOOLEAN NOT NULL DEFAULT false,
  "depositRefunded" BOOLEAN NOT NULL DEFAULT false,
  "notes" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContractSettlement_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContractSettlement_amounts_check" CHECK (
    "chargesVnd" >= 0 AND "discountsVnd" >= 0 AND "totalDueVnd" >= 0 AND "paidVnd" >= 0
    AND "outstandingVnd" >= 0 AND "depositVnd" >= 0 AND "depositAppliedVnd" >= 0
    AND "refundVnd" >= 0 AND "receivableVnd" >= 0
  )
);

CREATE UNIQUE INDEX "ContractSettlement_contractId_key" ON "ContractSettlement"("contractId");

ALTER TABLE "ContractSettlement"
ADD CONSTRAINT "ContractSettlement_contractId_fkey"
FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
