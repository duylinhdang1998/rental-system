-- Sprint 11: vehicle acquisition (cost / depreciation inputs) and the append-only expense ledger.
CREATE TYPE "ExpenseCategory" AS ENUM (
  'MAINTENANCE',
  'FUEL',
  'INSURANCE',
  'REGISTRATION',
  'RENT',
  'UTILITIES',
  'SALARY',
  'OTHER'
);

-- One acquisition record per vehicle; the Owner overwrites it and the audit log keeps history.
CREATE TABLE "VehicleAcquisition" (
  "vehicleId" TEXT NOT NULL,
  "purchasePriceVnd" INTEGER NOT NULL,
  "purchasedOn" DATE NOT NULL,
  "usefulLifeMonths" INTEGER NOT NULL,
  "salvageValueVnd" INTEGER NOT NULL DEFAULT 0,
  "updatedById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "VehicleAcquisition_pkey" PRIMARY KEY ("vehicleId"),
  CONSTRAINT "VehicleAcquisition_purchasePriceVnd_check" CHECK ("purchasePriceVnd" >= 0),
  CONSTRAINT "VehicleAcquisition_usefulLifeMonths_check" CHECK ("usefulLifeMonths" BETWEEN 1 AND 240),
  CONSTRAINT "VehicleAcquisition_salvageValueVnd_check" CHECK ("salvageValueVnd" >= 0 AND "salvageValueVnd" <= "purchasePriceVnd")
);

ALTER TABLE "VehicleAcquisition"
ADD CONSTRAINT "VehicleAcquisition_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Expense rows are immutable (BR-09): corrections are reversal rows pointing at the original.
-- The unique reversalOfId guarantees an expense is reversed at most once.
CREATE TABLE "Expense" (
  "id" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "category" "ExpenseCategory" NOT NULL,
  "amountVnd" INTEGER NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "paidOn" DATE NOT NULL,
  "description" TEXT NOT NULL,
  "reference" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "vehicleId" TEXT,
  "recordedById" TEXT NOT NULL,
  "reversalOfId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Expense_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Expense_amountVnd_check" CHECK ("amountVnd" > 0)
);

CREATE UNIQUE INDEX "Expense_idempotencyKey_key" ON "Expense"("idempotencyKey");
CREATE UNIQUE INDEX "Expense_reversalOfId_key" ON "Expense"("reversalOfId");
CREATE INDEX "Expense_paidOn_idx" ON "Expense"("paidOn");
CREATE INDEX "Expense_vehicleId_paidOn_idx" ON "Expense"("vehicleId", "paidOn");

ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Expense"
ADD CONSTRAINT "Expense_reversalOfId_fkey"
FOREIGN KEY ("reversalOfId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;
