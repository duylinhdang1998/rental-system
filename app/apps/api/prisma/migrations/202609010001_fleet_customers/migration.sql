CREATE TYPE "VehicleStatus" AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'DAMAGED', 'LOST', 'RETIRED');
CREATE TYPE "ContactType" AS ENUM ('PHONE', 'EMAIL');
CREATE TYPE "CustomerTagCode" AS ENUM ('BLACKLIST', 'VIP', 'WATCHLIST');

CREATE TABLE "VehicleType" (
  "id" TEXT NOT NULL, "code" TEXT NOT NULL, "name" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "VehicleType_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "VehicleType_code_key" ON "VehicleType"("code");

CREATE TABLE "Vehicle" (
  "id" TEXT NOT NULL, "code" TEXT NOT NULL, "plate" TEXT NOT NULL,
  "normalizedPlate" TEXT NOT NULL, "model" TEXT NOT NULL, "color" TEXT NOT NULL,
  "year" INTEGER NOT NULL, "status" "VehicleStatus" NOT NULL DEFAULT 'AVAILABLE',
  "typeId" TEXT NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL, CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Vehicle_code_key" ON "Vehicle"("code");
CREATE UNIQUE INDEX "Vehicle_normalizedPlate_key" ON "Vehicle"("normalizedPlate");
CREATE INDEX "Vehicle_status_idx" ON "Vehicle"("status");
CREATE INDEX "Vehicle_typeId_idx" ON "Vehicle"("typeId");
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "VehicleType"("id");

CREATE TABLE "VehicleStatusHistory" (
  "id" TEXT NOT NULL, "vehicleId" TEXT NOT NULL, "from" "VehicleStatus" NOT NULL,
  "to" "VehicleStatus" NOT NULL, "actorId" TEXT NOT NULL, "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "VehicleStatusHistory_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "VehicleStatusHistory_vehicleId_createdAt_idx" ON "VehicleStatusHistory"("vehicleId", "createdAt");
ALTER TABLE "VehicleStatusHistory" ADD CONSTRAINT "VehicleStatusHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE;

CREATE TABLE "Customer" (
  "id" TEXT NOT NULL, "name" TEXT NOT NULL, "nationality" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMPTZ NOT NULL,
  CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Customer_name_idx" ON "Customer"("name");
CREATE TABLE "CustomerContact" (
  "id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "type" "ContactType" NOT NULL,
  "value" TEXT NOT NULL, "normalizedValue" TEXT NOT NULL, "primary" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "CustomerContact_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CustomerContact_normalizedValue_idx" ON "CustomerContact"("normalizedValue");
CREATE INDEX "CustomerContact_customerId_idx" ON "CustomerContact"("customerId");
ALTER TABLE "CustomerContact" ADD CONSTRAINT "CustomerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;
CREATE TABLE "CustomerTag" (
  "id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "code" "CustomerTagCode" NOT NULL,
  "reason" TEXT NOT NULL, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerTag_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CustomerTag_customerId_idx" ON "CustomerTag"("customerId");
ALTER TABLE "CustomerTag" ADD CONSTRAINT "CustomerTag_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;
CREATE TABLE "CustomerDocument" (
  "id" TEXT NOT NULL, "customerId" TEXT NOT NULL, "label" TEXT NOT NULL, "objectKey" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CustomerDocument_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CustomerDocument_customerId_idx" ON "CustomerDocument"("customerId");
ALTER TABLE "CustomerDocument" ADD CONSTRAINT "CustomerDocument_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE;
CREATE TABLE "AuditEvent" (
  "id" TEXT NOT NULL, "action" TEXT NOT NULL, "actorId" TEXT NOT NULL, "entityId" TEXT NOT NULL,
  "entityType" TEXT NOT NULL, "metadata" JSONB, "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");
