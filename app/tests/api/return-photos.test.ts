import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { RETURN_PHOTO_LIMITS } from '@rental/contracts';
import { createApiApp } from '../../apps/api/src/main';
import { LifecycleClient, PAST_INTERVAL } from './support/lifecycle-client';

const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const JPEG = Buffer.from('ffd8ffe000104a464946', 'hex');
const RETURN_INPUT = { actualReturnAt: PAST_INTERVAL.endAt, condition: 'GOOD', fuelPercent: 60 };

describe('Feature: Return photos — private upload and signed links (US-028, NFR-02)', () => {
  let app: INestApplication;
  let staff: LifecycleClient;

  beforeEach(async () => {
    app = await createApiApp({ demoMode: true, nodeEnv: 'test' });
    staff = await new LifecycleClient(app).login();
  });

  afterEach(async () => app.close());

  function upload(id: string, files: [Buffer, string][]) {
    const call = staff.agent
      .post(`/api/contracts/${id}/return-photos`)
      .set('x-csrf-token', staff.csrf);
    return files.reduce((chain, [bytes, name]) => chain.attach('photos', bytes, name), call);
  }

  it('stores sniffed images under the contract folder and serves them only through signed links', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const uploaded = await upload(created.id, [
      [PNG, 'front.png'],
      [JPEG, 'anything.txt'],
    ]).expect(201);
    const keys = uploaded.body.objectKeys as string[];
    expect(keys).toHaveLength(2);
    expect(keys[0]).toMatch(new RegExp(`^private/returns/${created.id}/[0-9a-f-]{36}\\.png$`, 'u'));
    expect(keys[1]?.endsWith('.jpg')).toBe(true);

    const [lineId] = await staff.openLineIds(created.id);
    const returned = await staff
      .post(`/api/contracts/${created.id}/lines/${lineId}/return`, {
        ...RETURN_INPUT,
        imageObjectKeys: keys,
      })
      .expect(201);
    expect(returned.body.quote.lines[0].inspection.imageCount).toBe(2);
    expect(JSON.stringify(returned.body)).not.toContain('private/returns');

    const links = await staff
      .get(`/api/contracts/${created.id}/lines/${lineId}/return-photos`)
      .expect(200);
    expect(links.body.items).toHaveLength(2);
    expect(links.body.items[0]).toMatchObject({ expiresInSeconds: 300, index: 0 });
    const url = links.body.items[0].url as string;
    expect(url.startsWith('/api/private-files/')).toBe(true);
    expect(url).not.toContain('private/returns');

    const image = await staff.agent.get(url).expect(200);
    expect(image.headers['content-type']).toBe('image/png');
    expect(image.headers['cache-control']).toBe('private, no-store');
    expect(Buffer.from(image.body as Buffer).equals(PNG)).toBe(true);
    await staff.agent.get(`${url}x`).expect(404);
    await request(app.getHttpServer()).get(url).expect(401);
    await staff.get(`/api/contracts/${created.id}/lines/missing/return-photos`).expect(404);
  });

  it('refuses non-images, too many files, oversized files and contracts not being returned', async () => {
    const created = await staff.createActiveContract(['vehicle-001'], PAST_INTERVAL);
    const svg = await upload(created.id, [[Buffer.from('<svg onload=alert(1)/>'), 'x.png']]).expect(
      400,
    );
    expect(svg.body.error.code).toBe('UNSUPPORTED_FILE');
    const mixed = await upload(created.id, [
      [PNG, 'ok.png'],
      [Buffer.from('plain text'), 'bad.png'],
    ]).expect(400);
    expect(mixed.body.error.code).toBe('UNSUPPORTED_FILE');
    const tooMany = await upload(
      created.id,
      Array.from({ length: RETURN_PHOTO_LIMITS.maxFiles + 1 }, (_, index) => [PNG, `${index}.png`]),
    ).expect(400);
    expect(tooMany.body.error.code).toBe('TOO_MANY_FILES');
    const huge = Buffer.concat([PNG, Buffer.alloc(RETURN_PHOTO_LIMITS.maxBytes)]);
    await upload(created.id, [[huge, 'huge.png']]).expect(413);
    const empty = await staff.post(`/api/contracts/${created.id}/return-photos`).expect(400);
    expect(empty.body.error.code).toBe('INVALID_INPUT');
    await staff.agent
      .post(`/api/contracts/${created.id}/return-photos`)
      .attach('photos', PNG, 'a.png')
      .expect(403);

    const reserved = await staff.createContract(['vehicle-003']);
    const blocked = await upload(reserved.id, [[PNG, 'a.png']]).expect(409);
    expect(blocked.body.error.code).toBe('INVALID_TRANSITION');
    await upload('missing', [[PNG, 'a.png']]).expect(404);
  });
});
