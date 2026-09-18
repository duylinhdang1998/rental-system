import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { DiskFileStore } from '../../apps/api/src/common/files/disk-file-store';
import {
  contentTypeForKey,
  detectImageType,
} from '../../apps/api/src/common/files/image-signature';
import { MemoryFileStore } from '../../apps/api/src/common/files/memory-file-store';
import {
  SIGNED_LINK_TTL_SECONDS,
  SignedLinkService,
  signObjectKey,
  verifySignedToken,
} from '../../apps/api/src/common/files/signed-link.service';
import type { Environment } from '../../apps/api/src/config/environment';

const SECRET = 'a-secret-long-enough-for-tests-0123456789';
const KEY = 'private/returns/hd-1/photo.png';
const NOW_SECONDS = 1_800_000_000;
export const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
export const JPEG = Buffer.from('ffd8ffe000104a464946', 'hex');
const WEBP = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);

describe('Feature: Private files — signed links (NFR-02)', () => {
  it('round-trips a key until expiry and rejects tampered tokens', () => {
    const token = signObjectKey(SECRET, KEY, NOW_SECONDS + 60);
    expect(verifySignedToken(SECRET, token, NOW_SECONDS)).toBe(KEY);
    expect(verifySignedToken(SECRET, token, NOW_SECONDS + 60)).toBeNull();
    expect(verifySignedToken('other-secret', token, NOW_SECONDS)).toBeNull();
    const [key, expiry, mac] = token.split('.');
    expect(
      verifySignedToken(SECRET, `${key}.${Number(expiry) + 1}.${mac}`, NOW_SECONDS),
    ).toBeNull();
    const otherKey = Buffer.from('private/returns/hd-2/photo.png').toString('base64url');
    expect(verifySignedToken(SECRET, `${otherKey}.${expiry}.${mac}`, NOW_SECONDS)).toBeNull();
    expect(verifySignedToken(SECRET, 'garbage', NOW_SECONDS)).toBeNull();
    expect(verifySignedToken(SECRET, `${key}.soon.${mac}`, NOW_SECONDS)).toBeNull();
  });

  it('issues relative links with the configured lifetime', () => {
    const service = new SignedLinkService({ SESSION_SECRET: SECRET } as Environment);
    const link = service.sign(KEY, NOW_SECONDS * 1000);
    expect(link.expiresInSeconds).toBe(SIGNED_LINK_TTL_SECONDS);
    expect(link.url.startsWith('/api/private-files/')).toBe(true);
    const token = link.url.slice('/api/private-files/'.length);
    expect(service.verify(token, NOW_SECONDS * 1000)).toBe(KEY);
    expect(service.verify(token, (NOW_SECONDS + SIGNED_LINK_TTL_SECONDS) * 1000)).toBeNull();
  });
});

describe('Feature: Private files — image sniffing and stores', () => {
  it('detects JPEG, PNG and WebP by magic bytes and types by stored extension', () => {
    expect(detectImageType(PNG)).toEqual({ contentType: 'image/png', extension: 'png' });
    expect(detectImageType(JPEG)).toEqual({ contentType: 'image/jpeg', extension: 'jpg' });
    expect(detectImageType(WEBP)).toEqual({ contentType: 'image/webp', extension: 'webp' });
    expect(detectImageType(Buffer.from('<svg onload=alert(1)>'))).toBeNull();
    expect(detectImageType(Buffer.from('RIFF....WAVE'))).toBeNull();
    expect(detectImageType(Buffer.alloc(0))).toBeNull();
    expect(contentTypeForKey('a/b.webp')).toBe('image/webp');
    expect(contentTypeForKey('a/b.bin')).toBe('application/octet-stream');
  });

  it('keeps bytes in memory and returns copies', async () => {
    const store = new MemoryFileStore();
    await expect(store.get(KEY)).resolves.toBeNull();
    await store.put(KEY, PNG);
    const stored = await store.get(KEY);
    expect(stored).toMatchObject({ contentType: 'image/png' });
    expect(stored?.bytes.equals(PNG)).toBe(true);
    expect(store.size()).toBe(1);
  });

  describe('disk store', () => {
    let root = '';

    beforeAll(async () => {
      root = await mkdtemp(join(tmpdir(), 'rental-files-'));
    });

    afterAll(async () => {
      await rm(root, { force: true, recursive: true });
    });

    it('writes under the root, answers null for missing keys and refuses traversal', async () => {
      const store = new DiskFileStore(root);
      await store.put(KEY, JPEG);
      const stored = await store.get(KEY);
      expect(stored).toMatchObject({ contentType: 'image/png' });
      expect(stored?.bytes.equals(JPEG)).toBe(true);
      await expect(store.get('private/returns/hd-1/missing.png')).resolves.toBeNull();
      await expect(store.get('../etc/passwd')).rejects.toMatchObject({ code: 'INVALID_INPUT' });
      await expect(store.get('private/../../x.png')).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      });
      await expect(store.put('/abs/x.png', PNG)).rejects.toMatchObject({ code: 'INVALID_INPUT' });
      await expect(store.put('private/./x.png', PNG)).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      });
      await expect(store.put('private/a b.png', PNG)).rejects.toMatchObject({
        code: 'INVALID_INPUT',
      });
    });
  });
});
