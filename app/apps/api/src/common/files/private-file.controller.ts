import { Controller, Get, Inject, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { DomainError } from '../errors/domain.error.js';
import { AuthenticationGuard } from '../guards/authentication.guard.js';
import { PRIVATE_FILE_STORE } from './file-store.tokens.js';
import type { PrivateFileStore } from './file-store.types.js';
import { SignedLinkService } from './signed-link.service.js';

/** Streams one private object for a valid signed link; bad and expired links look the same (404). */
@Controller('private-files')
@UseGuards(AuthenticationGuard)
export class PrivateFileController {
  constructor(
    private readonly links: SignedLinkService,
    @Inject(PRIVATE_FILE_STORE) private readonly store: PrivateFileStore,
  ) {}

  @Get(':token')
  async read(@Param('token') token: string, @Res() response: Response) {
    const objectKey = this.links.verify(token);
    const file = objectKey ? await this.store.get(objectKey) : null;
    if (!file) {
      throw new DomainError('NOT_FOUND', 'Liên kết ảnh không hợp lệ hoặc đã hết hạn');
    }
    response.setHeader('cache-control', 'private, no-store');
    response.setHeader('content-type', file.contentType);
    response.setHeader('x-content-type-options', 'nosniff');
    response.send(file.bytes);
  }
}
