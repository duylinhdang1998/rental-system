export interface ImageType {
  contentType: string;
  extension: 'jpg' | 'png' | 'webp';
}

const JPEG_MAGIC = Buffer.from('ffd8ff', 'hex');
const PNG_MAGIC = Buffer.from('89504e470d0a1a0a', 'hex');
const RIFF_MAGIC = 'RIFF';
const WEBP_MAGIC = 'WEBP';
const WEBP_TAG_OFFSET = 8;
const WEBP_TAG_END = 12;
const OCTET_STREAM = 'application/octet-stream';

const CONTENT_TYPES: Record<ImageType['extension'], string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function startsWith(bytes: Buffer, magic: Buffer): boolean {
  return bytes.length >= magic.length && bytes.subarray(0, magic.length).equals(magic);
}

/** Sniffs JPEG / PNG / WebP by magic bytes; the client-supplied name and MIME type are ignored. */
export function detectImageType(bytes: Buffer): ImageType | null {
  if (startsWith(bytes, JPEG_MAGIC)) return { contentType: CONTENT_TYPES.jpg, extension: 'jpg' };
  if (startsWith(bytes, PNG_MAGIC)) return { contentType: CONTENT_TYPES.png, extension: 'png' };
  const riff = bytes.subarray(0, RIFF_MAGIC.length).toString('latin1') === RIFF_MAGIC;
  const webp = bytes.subarray(WEBP_TAG_OFFSET, WEBP_TAG_END).toString('latin1') === WEBP_MAGIC;
  if (riff && webp) return { contentType: CONTENT_TYPES.webp, extension: 'webp' };
  return null;
}

/** The stored extension is the only trusted source of the served content type. */
export function contentTypeForKey(objectKey: string): string {
  const extension = objectKey.split('.').at(-1) ?? '';
  return extension in CONTENT_TYPES
    ? CONTENT_TYPES[extension as ImageType['extension']]
    : OCTET_STREAM;
}
