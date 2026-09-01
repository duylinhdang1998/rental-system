import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  vehicleStatusSchema,
  type AvailabilityPeriod,
  type Vehicle,
  type VehicleInput,
  type VehicleStatus,
  type VehicleStatusHistory,
  type VehicleType,
  type VehicleTypeInput,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PrismaService } from '../../database/prisma.service.js';
import type { FleetRepository, VehicleQuery } from './fleet.types.js';

type VehicleWithType = Prisma.VehicleGetPayload<{ include: { type: true } }>;

@Injectable()
export class PrismaFleetRepository implements FleetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createType(input: VehicleTypeInput): Promise<VehicleType> {
    return this.prisma.vehicleType.create({ data: input });
  }

  async createVehicle(input: VehicleInput, normalizedPlate: string): Promise<Vehicle> {
    const type = await this.prisma.vehicleType.findUnique({ where: { code: input.typeCode } });
    if (!type) throw new DomainError('NOT_FOUND', 'Không tìm thấy loại xe');
    const created = await this.prisma.vehicle.create({
      data: {
        code: input.code,
        color: input.color,
        model: input.model,
        normalizedPlate,
        plate: input.plate,
        typeId: type.id,
        year: input.year,
      },
      include: { type: true },
    });
    return this.toVehicle(created);
  }

  async findByPlate(normalizedPlate: string): Promise<Vehicle | null> {
    const item = await this.prisma.vehicle.findUnique({
      include: { type: true },
      where: { normalizedPlate },
    });
    return item ? this.toVehicle(item) : null;
  }

  async listTypes(): Promise<VehicleType[]> {
    return this.prisma.vehicleType.findMany({ orderBy: { name: 'asc' } });
  }

  async listVehicles(query: VehicleQuery): Promise<Vehicle[]> {
    const where = this.where(query);
    const items = await this.prisma.vehicle.findMany({
      include: { type: true },
      orderBy: { code: 'asc' },
      where,
    });
    return items.map((item) => this.toVehicle(item));
  }

  periods(vehicle: Vehicle, days: string[]): Promise<AvailabilityPeriod[]> {
    return Promise.resolve(
      days.map((date) => ({ date, state: vehicle.status === 'RENTED' ? 'RENTED' : 'AVAILABLE' })),
    );
  }

  async statusHistory(id: string): Promise<VehicleStatusHistory[]> {
    const items = await this.prisma.vehicleStatusHistory.findMany({
      orderBy: { createdAt: 'asc' },
      where: { vehicleId: id },
    });
    return items.map((item) => ({
      actorId: item.actorId,
      at: item.createdAt.toISOString(),
      from: vehicleStatusSchema.parse(item.from),
      id: item.id,
      reason: item.reason,
      to: vehicleStatusSchema.parse(item.to),
    }));
  }

  async transition(
    id: string,
    status: VehicleStatus,
    actorId: string,
    reason: string,
  ): Promise<Vehicle | null> {
    const existing = await this.prisma.vehicle.findUnique({ where: { id } });
    if (!existing) return null;
    const [item] = await this.prisma.$transaction([
      this.prisma.vehicle.update({ data: { status }, include: { type: true }, where: { id } }),
      this.prisma.vehicleStatusHistory.create({
        data: { actorId, from: existing.status, reason, to: status, vehicleId: id },
      }),
    ]);
    return this.toVehicle(item);
  }

  private toVehicle(item: VehicleWithType): Vehicle {
    return {
      code: item.code,
      color: item.color,
      id: item.id,
      model: item.model,
      plate: item.plate,
      status: vehicleStatusSchema.parse(item.status),
      typeCode: item.type.code,
      year: item.year,
    };
  }

  private where(query: VehicleQuery): Prisma.VehicleWhereInput {
    const search = query.search;
    return {
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
              { plate: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.typeCode ? { type: { code: query.typeCode } } : {}),
    };
  }
}
