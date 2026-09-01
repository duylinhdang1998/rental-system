CREATE TYPE "ContractStatus" AS ENUM ('CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE "PricingVersion" (
  "id" TEXT NOT NULL,
  "typeCode" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PricingVersion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PricingTier" (
  "id" TEXT NOT NULL,
  "pricingVersionId" TEXT NOT NULL,
  "minDays" INTEGER NOT NULL,
  "maxDays" INTEGER,
  "dailyRateVnd" INTEGER NOT NULL,
  CONSTRAINT "PricingTier_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Contract" (
  "id" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "idempotencyKey" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "customerNameSnapshot" TEXT NOT NULL,
  "status" "ContractStatus" NOT NULL DEFAULT 'CONFIRMED',
  "deliveryFeeVnd" INTEGER NOT NULL,
  "totalVnd" INTEGER NOT NULL,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContractVehicleLine" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "vehicleId" TEXT NOT NULL,
  "pricingVersionId" TEXT NOT NULL,
  "startAt" TIMESTAMPTZ NOT NULL,
  "endAt" TIMESTAMPTZ NOT NULL,
  "billableDays" INTEGER NOT NULL,
  "dailyRateVnd" INTEGER NOT NULL,
  "baseSubtotalVnd" INTEGER NOT NULL,
  "adjustmentPercent" INTEGER NOT NULL,
  "finalSubtotalVnd" INTEGER NOT NULL,
  "explanation" TEXT NOT NULL,
  "overrideReason" TEXT,
  CONSTRAINT "ContractVehicleLine_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ContractHandover" (
  "id" TEXT NOT NULL,
  "contractId" TEXT NOT NULL,
  "depositVnd" INTEGER NOT NULL,
  "retainedDocument" TEXT NOT NULL,
  "deliveryPlace" TEXT NOT NULL,
  "fuelPercent" INTEGER NOT NULL,
  "notes" TEXT NOT NULL,
  "imageObjectKeys" TEXT[],
  CONSTRAINT "ContractHandover_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PricingVersion_typeCode_version_key" ON "PricingVersion"("typeCode", "version");
CREATE INDEX "PricingVersion_typeCode_createdAt_idx" ON "PricingVersion"("typeCode", "createdAt");
CREATE INDEX "PricingTier_pricingVersionId_minDays_idx" ON "PricingTier"("pricingVersionId", "minDays");
CREATE UNIQUE INDEX "Contract_code_key" ON "Contract"("code");
CREATE UNIQUE INDEX "Contract_idempotencyKey_key" ON "Contract"("idempotencyKey");
CREATE INDEX "Contract_customerId_createdAt_idx" ON "Contract"("customerId", "createdAt");
CREATE INDEX "ContractVehicleLine_vehicleId_startAt_endAt_idx" ON "ContractVehicleLine"("vehicleId", "startAt", "endAt");
CREATE INDEX "ContractVehicleLine_contractId_idx" ON "ContractVehicleLine"("contractId");
CREATE UNIQUE INDEX "ContractHandover_contractId_key" ON "ContractHandover"("contractId");

ALTER TABLE "PricingVersion" ADD CONSTRAINT "PricingVersion_typeCode_fkey" FOREIGN KEY ("typeCode") REFERENCES "VehicleType"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_pricingVersionId_fkey" FOREIGN KEY ("pricingVersionId") REFERENCES "PricingVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractVehicleLine" ADD CONSTRAINT "ContractVehicleLine_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ContractVehicleLine" ADD CONSTRAINT "ContractVehicleLine_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractVehicleLine" ADD CONSTRAINT "ContractVehicleLine_pricingVersionId_fkey" FOREIGN KEY ("pricingVersionId") REFERENCES "PricingVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ContractHandover" ADD CONSTRAINT "ContractHandover_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_valid_days" CHECK ("minDays" > 0 AND ("maxDays" IS NULL OR "maxDays" >= "minDays"));
ALTER TABLE "PricingTier" ADD CONSTRAINT "PricingTier_integer_vnd" CHECK ("dailyRateVnd" >= 0);
ALTER TABLE "ContractVehicleLine" ADD CONSTRAINT "ContractVehicleLine_valid_interval" CHECK ("startAt" < "endAt");
ALTER TABLE "ContractHandover" ADD CONSTRAINT "ContractHandover_valid_fuel" CHECK ("fuelPercent" BETWEEN 0 AND 100);

CREATE EXTENSION IF NOT EXISTS btree_gist;
ALTER TABLE "ContractVehicleLine"
  ADD CONSTRAINT "ContractVehicleLine_no_overlap"
  EXCLUDE USING gist ("vehicleId" WITH =, tstzrange("startAt", "endAt", '[)') WITH &&);
