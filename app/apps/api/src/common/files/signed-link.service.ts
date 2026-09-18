import { createHmac, timingSafeEqual } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { ENVIRONMENT } from '../../config/configuration.js';
import type { Environment } from '../../config/environment.js';

export const SIGNED_LINK_TTL_SECONDS = 300;
const MILLISECONDS_PER_SECOND = 1000;
const TOKEN_PARTS = 3;
const LINK_PATH = '/api/private-files/';

export interface SignedLink {
  expiresInSeconds: number;
  url: string;
}

function mac(secret: string, payload: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/** `<key>.<exp>.<mac>`: the MAC covers key and expiry, so neither can be swapped or extended. */
export function signObjectKey(secret: string, objectKey: string, expiresAt: number): string {
  const key = Buffer.from(objectKey, 'utf8').toString('base64url');
  return `${key}.${expiresAt}.${mac(secret, `${key}.${expiresAt}`)}`;
}

/** The object key when the token is intact and not yet expired; otherwise null. */
export function verifySignedToken(
  secret: string,
  token: string,
  nowSeconds: number,
): string | null {
  const parts = token.split('.');
  if (parts.length !== TOKEN_PARTS) return null;
  const [key = '', expiry = '', signature = ''] = parts;
  const expiresAt = Number(expiry);
  if (!Number.isInteger(expiresAt) || expiresAt <= nowSeconds) return null;
  const expected = Buffer.from(mac(secret, `${key}.${expiry}`));
  const given = Buffer.from(signature);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  return Buffer.from(key, 'base64url').toString('utf8');
}

@Injectable()
export class SignedLinkService {
  private readonly secret: string;

  constructor(@Inject(ENVIRONMENT) environment: Environment) {
    this.secret = environment.SESSION_SECRET;
  }

  sign(objectKey: string, now = Date.now()): SignedLink {
    const expiresAt = Math.floor(now / MILLISECONDS_PER_SECOND) + SIGNED_LINK_TTL_SECONDS;
    return {
      expiresInSeconds: SIGNED_LINK_TTL_SECONDS,
      url: `${LINK_PATH}${signObjectKey(this.secret, objectKey, expiresAt)}`,
    };
  }

  verify(token: string, now = Date.now()): string | null {
    return verifySignedToken(this.secret, token, Math.floor(now / MILLISECONDS_PER_SECOND));
  }
}
