-- Sprint 12: damage price list, cash shifts and the deposit-refund ledger kind.

-- A deposit refund is its own ledger row: neither revenue nor a refund of revenue (BR-11).
ALTER TYPE "PaymentKind" ADD VALUE 'DEPOSIT_REFUND';
ALTER TYPE "ContractEventType" ADD VALUE 'DEPOSIT_REFUNDED';

CREATE TYPE "CashShiftStatus" AS ENUM ('OPEN', 'CLOSED');

-- Owner-maintained damage catalog; a charge copies name and price at the time it is written.
CREATE TABLE "DamageItem" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "priceVnd" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "DamageItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "DamageItem_priceVnd_check" CHECK ("priceVnd" >= 0)
);

CREATE UNIQUE INDEX "DamageItem_code_key" ON "DamageItem"("code");

-- One cash shift per shop at a time; the close figures are frozen once written.
CREATE TABLE "CashShift" (
  "id" TEXT NOT NULL,
  "openedById" TEXT NOT NULL,
  "openedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "openingFloatVnd" INTEGER NOT NULL,
  "status" "CashShiftStatus" NOT NULL DEFAULT 'OPEN',
  "closedById" TEXT,
  "closedAt" TIMESTAMPTZ,
  "expectedCashVnd" INTEGER,
  "countedCashVnd" INTEGER,
  "varianceVnd" INTEGER,
  "note" TEXT NOT NULL DEFAULT '',
  CONSTRAINT "CashShift_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CashShift_openingFloatVnd_check" CHECK ("openingFloatVnd" >= 0),
  CONSTRAINT "CashShift_countedCashVnd_check" CHECK ("countedCashVnd" IS NULL OR "countedCashVnd" >= 0),
  CONSTRAINT "CashShift_closed_figures_check" CHECK (
    ("status" = 'OPEN' AND "closedAt" IS NULL AND "countedCashVnd" IS NULL)
    OR ("status" = 'CLOSED' AND "closedAt" IS NOT NULL AND "closedById" IS NOT NULL
        AND "expectedCashVnd" IS NOT NULL AND "countedCashVnd" IS NOT NULL AND "varianceVnd" IS NOT NULL)
  )
);

CREATE INDEX "CashShift_openedAt_idx" ON "CashShift"("openedAt");
CREATE INDEX "CashShift_openedById_openedAt_idx" ON "CashShift"("openedById", "openedAt");
-- Partial unique index: at most one OPEN shift; a concurrent second open fails with P2002.
CREATE UNIQUE INDEX "CashShift_single_open_key" ON "CashShift"("status") WHERE "status" = 'OPEN';
