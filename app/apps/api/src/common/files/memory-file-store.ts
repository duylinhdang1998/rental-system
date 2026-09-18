import { Injectable } from '@nestjs/common';
import type { PrivateFileStore, StoredFile } from './file-store.types.js';
import { contentTypeForKey } from './image-signature.js';

/** Demo and test store; nothing touches the disk and everything vanishes with the process. */
@Injectable()
export class MemoryFileStore implements PrivateFileStore {
  private readonly files = new Map<string, Buffer>();

  get(objectKey: string): Promise<StoredFile | null> {
    const bytes = this.files.get(objectKey);
    return Promise.resolve(
      bytes ? { bytes: Buffer.from(bytes), contentType: contentTypeForKey(objectKey) } : null,
    );
  }

  put(objectKey: string, bytes: Buffer): Promise<void> {
    this.files.set(objectKey, Buffer.from(bytes));
    return Promise.resolve();
  }

  size(): number {
    return this.files.size;
  }
}
