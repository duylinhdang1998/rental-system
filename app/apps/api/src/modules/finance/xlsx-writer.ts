import { deflateRawSync } from 'node:zlib';

/** A cell is either text (inline string) or a number; nothing else is needed for the report. */
export type SheetCell = string | number | null;

export interface Workbook {
  rows: SheetCell[][];
  sheetName: string;
}

const LETTERS = 26;
const CHAR_A = 65;
const BYTE = 0xff;
const CRC_POLY = 0xedb88320;
const CRC_INIT = 0xffffffff;
const CRC_ROUNDS = 8;
const DOS_EPOCH_YEAR = 1980;
const DOS_YEAR_SHIFT = 9;
const DOS_MONTH_SHIFT = 5;
const DOS_HOUR_SHIFT = 11;
const DOS_MINUTE_SHIFT = 5;
const ZIP_VERSION = 20;
const LOCAL_HEADER = 0x04034b50;
const CENTRAL_HEADER = 0x02014b50;
const END_HEADER = 0x06054b50;
const LOCAL_HEADER_SIZE = 30;
const CENTRAL_HEADER_SIZE = 46;
const END_SIZE = 22;
const METHOD_DEFLATE = 8;
const U16_BYTES = 2;
const U32_BYTES = 4;

const XML_DECLARATION = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
const CONTENT_TYPES_XML =
  XML_DECLARATION +
  '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
  '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
  '<Default Extension="xml" ContentType="application/xml"/>' +
  '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
  '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
  '</Types>';
const ROOT_RELS_XML =
  XML_DECLARATION +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
  '</Relationships>';
const WORKBOOK_RELS_XML =
  XML_DECLARATION +
  '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
  '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
  '</Relationships>';

const CRC_TABLE = new Uint32Array(BYTE + 1).map((_, index) => {
  let value = index;
  for (let round = 0; round < CRC_ROUNDS; round += 1) {
    value = value & 1 ? CRC_POLY ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(bytes: Uint8Array): number {
  let crc = CRC_INIT;
  for (const byte of bytes) crc = CRC_TABLE[(crc ^ byte) & BYTE]! ^ (crc >>> CRC_ROUNDS);
  return (crc ^ CRC_INIT) >>> 0;
}

export function columnName(index: number): string {
  let name = '';
  let current = index;
  do {
    name = String.fromCharCode(CHAR_A + (current % LETTERS)) + name;
    current = Math.floor(current / LETTERS) - 1;
  } while (current >= 0);
  return name;
}

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function cellXml(cell: SheetCell, reference: string): string {
  if (cell === null || cell === '') return '';
  if (typeof cell === 'number') return `<c r="${reference}"><v>${cell}</v></c>`;
  return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(cell)}</t></is></c>`;
}

export function sheetXml(rows: readonly SheetCell[][]): string {
  const body = rows
    .map((row, rowIndex) => {
      const cells = row.map((cell, columnIndex) =>
        cellXml(cell, `${columnName(columnIndex)}${rowIndex + 1}`),
      );
      return `<row r="${rowIndex + 1}">${cells.join('')}</row>`;
    })
    .join('');
  return (
    XML_DECLARATION +
    '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
    `<sheetData>${body}</sheetData></worksheet>`
  );
}

function workbookXml(sheetName: string): string {
  return (
    XML_DECLARATION +
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
    `<sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`
  );
}

function workbookParts(workbook: Workbook): Map<string, string> {
  return new Map([
    ['[Content_Types].xml', CONTENT_TYPES_XML],
    ['_rels/.rels', ROOT_RELS_XML],
    ['xl/workbook.xml', workbookXml(workbook.sheetName)],
    ['xl/_rels/workbook.xml.rels', WORKBOOK_RELS_XML],
    ['xl/worksheets/sheet1.xml', sheetXml(workbook.rows)],
  ]);
}

interface ZipEntry {
  compressed: Buffer;
  crc: number;
  name: Buffer;
  offset: number;
  size: number;
}

interface DosStamp {
  date: number;
  time: number;
}

/** Sequential little-endian writer: each header reads top to bottom without offset arithmetic. */
class ByteWriter {
  private readonly buffer: Buffer;
  private offset = 0;

  constructor(size: number) {
    this.buffer = Buffer.alloc(size);
  }

  u16(value: number): this {
    this.buffer.writeUInt16LE(value, this.offset);
    this.offset += U16_BYTES;
    return this;
  }

  u32(value: number): this {
    this.buffer.writeUInt32LE(value, this.offset);
    this.offset += U32_BYTES;
    return this;
  }

  bytes(): Buffer {
    return this.buffer;
  }
}

function dosStamp(at: Date): DosStamp {
  const year = Math.max(at.getUTCFullYear(), DOS_EPOCH_YEAR) - DOS_EPOCH_YEAR;
  return {
    date: (year << DOS_YEAR_SHIFT) | ((at.getUTCMonth() + 1) << DOS_MONTH_SHIFT) | at.getUTCDate(),
    time:
      (at.getUTCHours() << DOS_HOUR_SHIFT) |
      (at.getUTCMinutes() << DOS_MINUTE_SHIFT) |
      (at.getUTCSeconds() >> 1),
  };
}

function localHeader(entry: ZipEntry, stamp: DosStamp): Buffer {
  const header = new ByteWriter(LOCAL_HEADER_SIZE)
    .u32(LOCAL_HEADER)
    .u16(ZIP_VERSION)
    .u16(0) // general-purpose flags
    .u16(METHOD_DEFLATE)
    .u16(stamp.time)
    .u16(stamp.date)
    .u32(entry.crc)
    .u32(entry.compressed.length)
    .u32(entry.size)
    .u16(entry.name.length)
    .u16(0) // extra field length
    .bytes();
  return Buffer.concat([header, entry.name]);
}

function centralHeader(entry: ZipEntry, stamp: DosStamp): Buffer {
  const header = new ByteWriter(CENTRAL_HEADER_SIZE)
    .u32(CENTRAL_HEADER)
    .u16(ZIP_VERSION) // made by
    .u16(ZIP_VERSION) // needed to extract
    .u16(0) // general-purpose flags
    .u16(METHOD_DEFLATE)
    .u16(stamp.time)
    .u16(stamp.date)
    .u32(entry.crc)
    .u32(entry.compressed.length)
    .u32(entry.size)
    .u16(entry.name.length)
    .u16(0) // extra field length
    .u16(0) // comment length
    .u16(0) // disk number start
    .u16(0) // internal attributes
    .u32(0) // external attributes
    .u32(entry.offset)
    .bytes();
  return Buffer.concat([header, entry.name]);
}

function endRecord(count: number, size: number, offset: number): Buffer {
  return new ByteWriter(END_SIZE)
    .u32(END_HEADER)
    .u16(0) // this disk
    .u16(0) // directory disk
    .u16(count)
    .u16(count)
    .u32(size)
    .u32(offset)
    .u16(0) // comment length
    .bytes();
}

/** Minimal ZIP container (deflate entries, no zip64) — enough for a single-sheet workbook. */
export function zipParts(parts: ReadonlyMap<string, string>, at = new Date()): Buffer {
  const stamp = dosStamp(at);
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const [name, content] of parts) {
    const bytes = Buffer.from(content, 'utf8');
    const entry: ZipEntry = {
      compressed: deflateRawSync(bytes),
      crc: crc32(bytes),
      name: Buffer.from(name, 'utf8'),
      offset,
      size: bytes.length,
    };
    const local = Buffer.concat([localHeader(entry, stamp), entry.compressed]);
    locals.push(local);
    centrals.push(centralHeader(entry, stamp));
    offset += local.length;
  }
  const directory = Buffer.concat(centrals);
  return Buffer.concat([...locals, directory, endRecord(parts.size, directory.length, offset)]);
}

export function encodeWorkbook(workbook: Workbook, at = new Date()): Buffer {
  return zipParts(workbookParts(workbook), at);
}
