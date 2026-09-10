-- Sprint 6: append-only payment ledger, receivables and revenue reporting.
ALTER TYPE "ContractEventType" ADD VALUE IF NOT EXISTS 'PAYMENT_RECORDED';
ALTER TYPE "ContractEventType" ADD VALUE IF NOT EXISTS 'REFUND_RECORDED';

CREATE TYPE "PaymentKind" AS ENUM ('PAYMENT', 'REFUND');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK_TRANSFER');

-- Ledger rows are immutable (BR-07): no UPDATE/DELETE path exists in the API.
-- The unique idempotency key makes a replayed request return the stored row instead of a duplicate.
CREATE TABLE "ContractPayment" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "kind" "PaymentKind" NOT NULL,
  "method" "PaymentMethod" NOT NULL,
  "amountVnd" INTEGER NOT NULL,
  "reference" TEXT NOT NULL DEFAULT '',
  "notes" TEXT NOT NULL DEFAULT '',
  "receivedById" TEXT NOT NULL,
  "receivedAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContractPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ContractPayment_amountVnd_check" CHECK ("amountVnd" > 0)
);

CREATE UNIQUE INDEX "ContractPayment_idempotencyKey_key" ON "ContractPayment"("idempotencyKey");
CREATE INDEX "ContractPayment_contractId_receivedAt_idx" ON "ContractPayment"("contractId", "receivedAt");
CREATE INDEX "ContractPayment_receivedAt_idx" ON "ContractPayment"("receivedAt");

ALTER TABLE "ContractPayment"
ADD CONSTRAINT "ContractPayment_contractId_fkey"
FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
