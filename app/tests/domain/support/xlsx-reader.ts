import { inflateRawSync } from 'node:zlib';

const LOCAL_SIGNATURE = 0x04034b50;
const HEADER_SIZE = 30;
const METHOD_OFFSET = 8;
const SIZE_OFFSET = 18;
const NAME_LENGTH_OFFSET = 26;
const EXTRA_LENGTH_OFFSET = 28;
const METHOD_DEFLATE = 8;

/** Reads every local entry of a small ZIP (as written by the report exporter) into text. */
export function readZipEntries(archive: Buffer): Map<string, string> {
  const entries = new Map<string, string>();
  let offset = 0;
  while (
    offset + HEADER_SIZE <= archive.length &&
    archive.readUInt32LE(offset) === LOCAL_SIGNATURE
  ) {
    const method = archive.readUInt16LE(offset + METHOD_OFFSET);
    const compressedSize = archive.readUInt32LE(offset + SIZE_OFFSET);
    const nameLength = archive.readUInt16LE(offset + NAME_LENGTH_OFFSET);
    const extraLength = archive.readUInt16LE(offset + EXTRA_LENGTH_OFFSET);
    const nameStart = offset + HEADER_SIZE;
    const dataStart = nameStart + nameLength + extraLength;
    const name = archive.subarray(nameStart, nameStart + nameLength).toString('utf8');
    const data = archive.subarray(dataStart, dataStart + compressedSize);
    const content = method === METHOD_DEFLATE ? inflateRawSync(data) : data;
    entries.set(name, content.toString('utf8'));
    offset = dataStart + compressedSize;
  }
  return entries;
}
