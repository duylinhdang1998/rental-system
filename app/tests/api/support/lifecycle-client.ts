import type { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import request from 'supertest';
import { csrfFrom } from './csrf';

export interface Interval {
  endAt: string;
  startAt: string;
}

export interface HandoverOverrides {
  depositVnd?: number;
  retainedDocument?: string;
}

interface CreatedContract {
  code: string;
  id: string;
  quote: { endAt: string; totalVnd: number };
}

interface StoredContract {
  quote: { lines: { id: string; inspection: unknown }[] };
}

interface VehicleRow {
  id: string;
  status: string;
}

const HTTP_OK = 200;
const HTTP_CREATED = 201;

export const OCTOBER_INTERVAL: Interval = {
  endAt: '2026-10-06T08:00:00.000Z',
  startAt: '2026-10-01T08:00:00.000Z',
};

export const PAST_INTERVAL: Interval = {
  endAt: '2026-09-02T08:00:00.000Z',
  startAt: '2026-09-01T08:00:00.000Z',
};

export function contractInput(
  vehicleIds: string[],
  interval: Interval = OCTOBER_INTERVAL,
  handover: HandoverOverrides = {},
) {
  return {
    confirmed: true,
    customerId: 'demo-customer',
    deliveryFeeVnd: 0,
    ...interval,
    handover: {
      deliveryPlace: 'Cửa hàng',
      depositVnd: 0,
      fuelPercent: 75,
      imageObjectKeys: [],
      notes: '',
      retainedDocument: '',
      ...handover,
    },
    idempotencyKey: crypto.randomUUID(),
    overrides: [],
    vehicleIds,
  };
}

export class LifecycleClient {
  readonly agent: ReturnType<typeof request.agent>;
  csrf = '';

  constructor(app: INestApplication) {
    this.agent = request.agent(app.getHttpServer() as Server);
  }

  async login(username = 'staff', password = 'StaffDemo!2026') {
    const login = await this.agent
      .post('/api/auth/login')
      .send({ password, username })
      .expect(HTTP_CREATED);
    this.csrf = csrfFrom(login);
    return this;
  }

  post(path: string, body: object = {}) {
    return this.agent.post(path).set('x-csrf-token', this.csrf).send(body);
  }

  get(path: string) {
    return this.agent.get(path);
  }

  async createContract(
    vehicleIds: string[],
    interval: Interval = OCTOBER_INTERVAL,
    handover: HandoverOverrides = {},
  ): Promise<CreatedContract> {
    const response = await this.post(
      '/api/contracts',
      contractInput(vehicleIds, interval, handover),
    ).expect(HTTP_CREATED);
    return response.body as CreatedContract;
  }

  async createActiveContract(
    vehicleIds: string[],
    interval: Interval = OCTOBER_INTERVAL,
    handover: HandoverOverrides = {},
  ) {
    const created = await this.createContract(vehicleIds, interval, handover);
    await this.post(`/api/contracts/${created.id}/activate`).expect(HTTP_CREATED);
    return created;
  }

  /** Ids of the lines whose vehicle is still with the customer, in contract order. */
  async openLineIds(id: string): Promise<string[]> {
    const response = await this.get(`/api/contracts/${id}`).expect(HTTP_OK);
    const body = response.body as StoredContract;
    return body.quote.lines.filter((line) => line.inspection === null).map((line) => line.id);
  }

  async vehicle(id: string): Promise<VehicleRow | undefined> {
    const response = await this.get('/api/fleet/vehicles').expect(HTTP_OK);
    const body = response.body as { items: VehicleRow[] };
    return body.items.find((item) => item.id === id);
  }
}
