import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import {
  RETURN_PHOTO_LIMITS,
  type ReturnPhotoList,
  type ReturnPhotoUpload,
} from '@rental/contracts';
import { DomainError } from '../../common/errors/domain.error.js';
import { PRIVATE_FILE_STORE } from '../../common/files/file-store.tokens.js';
import type { PrivateFileStore } from '../../common/files/file-store.types.js';
import { detectImageType, type ImageType } from '../../common/files/image-signature.js';
import { SignedLinkService } from '../../common/files/signed-link.service.js';
import { isRentingContract } from './contract-lifecycle.policy.js';
import { returnPhotoPrefix } from './contract-return.service.js';
import { requireContract } from './contract-view.js';
import { CONTRACT_REPOSITORY } from './contract.tokens.js';
import type { ContractRepository } from './contract.types.js';

/** The slice of a multer file the service needs; the client name and MIME type are ignored. */
export interface UploadedPhoto {
  buffer: Buffer;
  size: number;
}

interface DetectedPhoto extends ImageType {
  bytes: Buffer;
}

/** Every file is sniffed before the first write, so a refused batch leaves nothing behind. */
function detectAll(files: readonly UploadedPhoto[]): DetectedPhoto[] {
  if (files.length === 0) throw new DomainError('INVALID_INPUT', 'Chọn ít nhất một ảnh nhận xe');
  if (files.length > RETURN_PHOTO_LIMITS.maxFiles) {
    throw new DomainError('TOO_MANY_FILES', `Tối đa ${RETURN_PHOTO_LIMITS.maxFiles} ảnh mỗi lần`);
  }
  return files.map((file) => {
    const type = detectImageType(file.buffer);
    if (!type) throw new DomainError('UNSUPPORTED_FILE', 'Chỉ nhận ảnh JPEG, PNG hoặc WebP');
    return { ...type, bytes: file.buffer };
  });
}

/** US-028: return photos live in private storage and are read only through signed links. */
@Injectable()
export class ContractPhotoService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly repository: ContractRepository,
    @Inject(PRIVATE_FILE_STORE) private readonly store: PrivateFileStore,
    private readonly signer: SignedLinkService,
  ) {}

  async upload(id: string, files: readonly UploadedPhoto[]): Promise<ReturnPhotoUpload> {
    const contract = await requireContract(this.repository, id);
    if (!isRentingContract(contract.status)) {
      throw new DomainError(
        'INVALID_TRANSITION',
        'Chỉ tải ảnh nhận xe khi hợp đồng đang thuê hoặc quá hạn',
      );
    }
    const photos = detectAll(files);
    const prefix = returnPhotoPrefix(contract.id);
    const objectKeys = await Promise.all(
      photos.map(async (photo) => {
        const objectKey = `${prefix}${randomUUID()}.${photo.extension}`;
        await this.store.put(objectKey, photo.bytes);
        return objectKey;
      }),
    );
    return { objectKeys };
  }

  async photoLinks(id: string, lineId: string): Promise<ReturnPhotoList> {
    const keys = await this.repository.returnImageObjectKeys(id, lineId);
    return { items: keys.map((key, index) => ({ index, ...this.signer.sign(key) })) };
  }
}
