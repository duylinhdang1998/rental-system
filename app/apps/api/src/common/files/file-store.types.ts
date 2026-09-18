export interface StoredFile {
  bytes: Buffer;
  contentType: string;
}

/**
 * Private object storage behind one port: memory in demo / test, local disk by default and an
 * S3-compatible bucket later. Keys are opaque paths such as `private/returns/<contract>/<uuid>.png`.
 */
export interface PrivateFileStore {
  get(objectKey: string): Promise<StoredFile | null>;
  put(objectKey: string, bytes: Buffer): Promise<void>;
}
