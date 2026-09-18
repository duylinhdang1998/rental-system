import { REPORT_COLUMNS, type RevenueReport } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import { daySpan, reportWindow } from '../../apps/api/src/modules/finance/report-range';
import {
  REPORT_SHEET_NAME,
  RevenueExportService,
  exportFileName,
  exportRows,
} from '../../apps/api/src/modules/finance/revenue-export.service';
import {
  contractRows,
  dailyRows,
  employeeRows,
  paymentsInWindow,
  revenueTotals,
} from '../../apps/api/src/modules/finance/revenue-report.policy';
import {
  columnName,
  encodeWorkbook,
  sheetXml,
} from '../../apps/api/src/modules/finance/xlsx-writer';
import {
  contractFixture,
  contractLine,
  inspectionFixture,
  paymentFixture,
} from './support/contract-fixture';
import { readZipEntries } from './support/xlsx-reader';

const RANGE = { from: '2026-09-10', to: '2026-09-11' };
const NAMES = new Map([
  ['staff-1', 'Nhân viên'],
  ['owner-1', 'Chủ cửa hàng'],
]);
const CONTACTS = new Map([['demo-customer', '0900 000 001']]);
const FIRST_START = '2026-08-30T08:00:00.000Z';
const FIRST_END = '2026-09-02T08:00:00.000Z';

const first = contractFixture({
  code: 'HD-2026-FIRST',
  completedAt: '2026-09-02T09:30:00.000Z',
  depositVnd: 500_000,
  endAt: FIRST_END,
  lines: [
    contractLine({
      billableDays: 3,
      endAt: FIRST_END,
      finalSubtotalVnd: 450_000,
      inspection: inspectionFixture({ actualReturnAt: '2026-09-02T09:30:00.000Z' }),
      startAt: FIRST_START,
    }),
  ],
  payments: [
    paymentFixture({
      amountVnd: 300_000,
      id: 'p1',
      method: 'BANK_TRANSFER',
      receivedAt: '2026-09-09T17:30:00.000Z',
      reference: 'FT123',
    }),
    paymentFixture({
      amountVnd: 100_000,
      id: 'p2',
      notes: 'Thu tại quầy',
      receivedAt: '2026-09-10T03:00:00.000Z',
    }),
    paymentFixture({
      amountVnd: 50_000,
      id: 'p3',
      kind: 'REFUND',
      receivedAt: '2026-09-11T02:00:00.000Z',
    }),
    paymentFixture({ amountVnd: 10_000, id: 'p-outside', receivedAt: '2026-09-12T02:00:00.000Z' }),
    paymentFixture({
      amountVnd: 350_000,
      id: 'p-deposit',
      kind: 'DEPOSIT_REFUND',
      receivedAt: '2026-09-11T03:00:00.000Z',
    }),
  ],
  retainedDocument: 'CCCD 0000',
  startAt: FIRST_START,
  status: 'COMPLETED',
});
const second = contractFixture({
  code: 'HD-2026-SECOND',
  payments: [
    paymentFixture({
      amountVnd: 50_000,
      id: 'p4',
      method: 'BANK_TRANSFER',
      receivedAt: '2026-09-11T02:00:00.000Z',
      receivedById: 'owner-1',
    }),
  ],
  status: 'ACTIVE',
});
const untouched = contractFixture({ code: 'HD-2026-NONE' });

function buildReport(): RevenueReport {
  const window = reportWindow(RANGE);
  const rows = paymentsInWindow([first, second, untouched], window);
  return {
    aging: { count: 0, rows: [], totalVnd: 0 },
    days: dailyRows(rows),
    employees: employeeRows(rows, NAMES),
    from: RANGE.from,
    generatedAt: '2026-09-11T10:00:00.000Z',
    rows: contractRows(rows, { contacts: CONTACTS, names: NAMES }),
    timeZone: window.timeZone,
    to: RANGE.to,
    totals: revenueTotals(rows),
  };
}

describe('Feature: Revenue report — range and grouping', () => {
  it('validates the range: order, span and calendar validity', () => {
    expect(reportWindow(RANGE)).toMatchObject({
      endAt: new Date('2026-09-11T17:00:00.000Z'),
      startAt: new Date('2026-09-09T17:00:00.000Z'),
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    expect(daySpan({ from: '2026-06-01', to: '2026-09-01' })).toBe(92);
    expect(() => reportWindow({ from: '2026-09-11', to: '2026-09-10' })).toThrow('sau hoặc bằng');
    expect(() => reportWindow({ from: '2026-06-01', to: '2026-09-01' })).toThrow('tối đa 92');
    expect(() => reportWindow({ from: '2026-13-01', to: '2026-13-02' })).toThrow('không hợp lệ');
    expect(() => reportWindow({ from: '2026-06-02', to: '2026-09-01' })).not.toThrow();
  });

  it('groups money by business day, totals the period and ignores deposit refunds (BR-11)', () => {
    const rows = paymentsInWindow([first, second, untouched], reportWindow(RANGE));
    expect(rows.map((row) => row.payment.id)).toEqual(['p1', 'p2', 'p3', 'p4']);
    expect(revenueTotals(rows)).toEqual({
      cashVnd: 100_000,
      contractCount: 2,
      netVnd: 400_000,
      paymentCount: 4,
      refundVnd: 50_000,
      transferVnd: 350_000,
    });
    expect(dailyRows(rows)).toMatchObject([
      {
        cashVnd: 100_000,
        day: '2026-09-10',
        netVnd: 400_000,
        paymentCount: 2,
        transferVnd: 300_000,
      },
      { cashVnd: 0, day: '2026-09-11', netVnd: 0, paymentCount: 2, refundVnd: 50_000 },
    ]);
  });

  it('ranks employees by net collection and falls back to the id', () => {
    const rows = paymentsInWindow([first, second], reportWindow(RANGE));
    expect(employeeRows(rows, NAMES)).toMatchObject([
      { employeeId: 'staff-1', employeeName: 'Nhân viên', netVnd: 350_000, paymentCount: 3 },
      { employeeId: 'owner-1', employeeName: 'Chủ cửa hàng', netVnd: 50_000, paymentCount: 1 },
    ]);
    expect(employeeRows(rows, new Map())[1]?.employeeName).toBe('owner-1');
  });

  it('builds one client row per contract with net money by method', () => {
    const rows = contractRows(paymentsInWindow([first, second], reportWindow(RANGE)), {
      contacts: CONTACTS,
      names: NAMES,
    });
    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      address: 'Cửa hàng',
      cashVnd: 50_000,
      code: 'HD-2026-FIRST',
      contact: '0900 000 001',
      contractId: 'hd-2026-first',
      customerName: 'Khách hàng mẫu',
      depositOrDocument: 'Cọc 500.000 ₫ · CCCD 0000',
      employeeName: 'Nhân viên',
      notes: 'Thu tại quầy',
      rentalDays: 3,
      returnAt: '2026-09-02T09:30:00.000Z',
      sequence: 1,
      time: '2026-09-09T17:30:00.000Z',
      transferVnd: 300_000,
      unitPriceVnd: 150_000,
      vehicleCodes: ['XE-001'],
    });
    expect(rows[1]).toMatchObject({
      cashVnd: 0,
      depositOrDocument: '',
      employeeName: 'Chủ cửa hàng',
      returnAt: null,
      sequence: 2,
      transferVnd: 50_000,
    });
  });
});

describe('Feature: Revenue export — Excel workbook without third-party writers', () => {
  it('names columns the spreadsheet way and escapes cell text', () => {
    expect([0, 25, 26, 27, 701, 702].map(columnName)).toEqual(['A', 'Z', 'AA', 'AB', 'ZZ', 'AAA']);
    expect(sheetXml([['a<b', 1, null, '']])).toContain(
      '<row r="1"><c r="A1" t="inlineStr"><is><t xml:space="preserve">a&lt;b</t></is></c>' +
        '<c r="B1"><v>1</v></c></row>',
    );
  });

  it('writes the approved 14-column layout with a totals row and a deterministic file name', () => {
    const report = buildReport();
    const sheet = exportRows(report);
    expect(REPORT_COLUMNS).toHaveLength(14);
    expect(sheet[0]).toEqual([...REPORT_COLUMNS]);
    expect(sheet[1]).toEqual([
      1,
      'Khách hàng mẫu',
      '0900 000 001',
      expect.stringMatching(/00:30/u),
      '2026-09-02',
      'XE-001',
      3,
      150_000,
      300_000,
      50_000,
      'Cọc 500.000 ₫ · CCCD 0000',
      'Cửa hàng',
      'Nhân viên',
      'Thu tại quầy',
    ]);
    expect(sheet[1]?.[3]).toMatch(/10\/09\/2026/u);
    expect(sheet.at(-1)).toEqual([
      null,
      'Tổng cộng',
      null,
      null,
      null,
      null,
      null,
      null,
      350_000,
      50_000,
      null,
      null,
      null,
      null,
    ]);
    expect(exportFileName(report)).toBe('doanh-thu-2026-09-10-2026-09-11.xlsx');
  });

  it('packs the workbook as a ZIP that spreadsheet tools can open', () => {
    const report = buildReport();
    const bytes = new RevenueExportService().workbook(report);
    expect(bytes.subarray(0, 2).toString()).toBe('PK');
    const entries = readZipEntries(bytes);
    expect([...entries.keys()]).toEqual([
      '[Content_Types].xml',
      '_rels/.rels',
      'xl/workbook.xml',
      'xl/_rels/workbook.xml.rels',
      'xl/worksheets/sheet1.xml',
    ]);
    expect(entries.get('xl/workbook.xml')).toContain(
      `<sheet name="${REPORT_SHEET_NAME}" sheetId="1"`,
    );
    const sheet = entries.get('xl/worksheets/sheet1.xml') ?? '';
    expect(sheet).toContain('<t xml:space="preserve">STT</t>');
    expect(sheet).toContain('<t xml:space="preserve">Tổng cộng</t>');
    expect(sheet).toContain('<c r="I4"><v>350000</v></c>');
    expect(sheet).toContain('<c r="J4"><v>50000</v></c>');
    const at = new Date('2026-09-11T10:00:00.000Z');
    const workbook = { rows: [['x']], sheetName: 'A&B' };
    expect(encodeWorkbook(workbook, at).equals(encodeWorkbook(workbook, at))).toBe(true);
    expect(readZipEntries(encodeWorkbook(workbook, at)).get('xl/workbook.xml')).toContain(
      'A&amp;B',
    );
  });
});
