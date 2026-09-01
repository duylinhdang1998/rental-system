ALTER TABLE "PricingVersion"
ADD COLUMN "lateReturnGraceMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "lateReturnHourlyRateVnd" INTEGER NOT NULL DEFAULT 20000;

ALTER TABLE "ContractVehicleLine"
ADD COLUMN "lateReturnGraceMinutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN "lateReturnHourlyRateVnd" INTEGER NOT NULL DEFAULT 20000;

ALTER TABLE "PricingVersion"
ADD CONSTRAINT "PricingVersion_late_return_policy_check"
CHECK ("lateReturnGraceMinutes" BETWEEN 0 AND 1440 AND "lateReturnHourlyRateVnd" >= 0);

ALTER TABLE "ContractVehicleLine"
ADD CONSTRAINT "ContractVehicleLine_late_return_policy_check"
CHECK ("lateReturnGraceMinutes" BETWEEN 0 AND 1440 AND "lateReturnHourlyRateVnd" >= 0);
