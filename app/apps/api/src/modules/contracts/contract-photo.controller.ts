import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { RETURN_PHOTO_LIMITS } from '@rental/contracts';
import { AuthenticationGuard } from '../../common/guards/authentication.guard.js';
import { ThrottlePolicy } from '../../common/throttle/throttle.decorator.js';
import { CsrfGuard } from '../auth/csrf.guard.js';
import { ContractPhotoService, type UploadedPhoto } from './contract-photo.service.js';

const FIELD_NAME = 'photos';
/** Above the business limit so the service answers TOO_MANY_FILES instead of a generic multer error. */
const PARSER_FILE_LIMIT = 20;

@Controller('contracts')
@UseGuards(AuthenticationGuard)
export class ContractPhotoController {
  constructor(private readonly photos: ContractPhotoService) {}

  /** Signed, short-lived links for one line's inspection photos; keys themselves never leave. */
  @Get(':id/lines/:lineId/return-photos')
  links(@Param('id') id: string, @Param('lineId') lineId: string) {
    return this.photos.photoLinks(id, lineId);
  }

  /** Multipart `photos[]`; a file above 2 MB is cut by the parser (413) before it is sniffed. */
  @Post(':id/return-photos')
  @UseGuards(CsrfGuard)
  @ThrottlePolicy('upload')
  @UseInterceptors(
    FilesInterceptor(FIELD_NAME, PARSER_FILE_LIMIT, {
      limits: { fileSize: RETURN_PHOTO_LIMITS.maxBytes },
    }),
  )
  upload(@Param('id') id: string, @UploadedFiles() files: UploadedPhoto[] | undefined) {
    return this.photos.upload(id, files ?? []);
  }
}
