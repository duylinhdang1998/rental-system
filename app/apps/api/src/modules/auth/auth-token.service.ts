import { createHash, randomBytes } from 'node:crypto';
import { Injectable } from '@nestjs/common';

const TOKEN_BYTES = 32;

export interface TokenPair {
  hash: string;
  raw: string;
}

@Injectable()
export class AuthTokenService {
  issue(): TokenPair {
    const raw = randomBytes(TOKEN_BYTES).toString('base64url');
    return { hash: this.hash(raw), raw };
  }

  hash(raw: string): string {
    return createHash('sha256').update(raw).digest('hex');
  }
}
