import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

const ACCESS_SECONDS = 300;

@Injectable()
export class PrivateFileService {
  createAccess(objectKey: string): { expiresInSeconds: number; url: string } {
    const token = createHash('sha256').update(`${objectKey}:${Date.now()}`).digest('hex');
    return { expiresInSeconds: ACCESS_SECONDS, url: `/api/private-files/${token}` };
  }
}
