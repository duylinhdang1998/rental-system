import type { ReportContractRow, RevenueTotals } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  REPORT_COLUMN_KEYS,
  agingLabelKey,
  collectionShare,
  contractRowCells,
  dailyMoneyRows,
  defaultReportRange,
  employeeMoneyRows,
  maxDailyNet,
  rangeIssue,
} from '../../apps/admin/src/features/reporting/lib/report-presentation';
import { formatCurrency } from '../../apps/admin/src/shared/i18n/locale';

const vnd = (value: number) => formatCurrency(value, 'vi');

const TOTALS: RevenueTotals = {
  cashVnd: 100_000,
  contractCount: 2,
  netVnd: 400_000,
  paymentCount: 4,
  refundVnd: 50_000,
  transferVnd: 350_000,
};

const ROW: ReportContractRow = {
  address: 'Cửa hàng',
  cashVnd: 100_000,
  code: 'HD-2026-0001',
  contact: '0900 000 001',
  contractId: 'hd-1',
  customerName: 'Khách hàng mẫu',
  depositOrDocument: 'Cọc 500.000 ₫ · CCCD 0000',
  employeeName: 'Nhân viên',
  notes: 'Thu lần 1',
  rentalDays: 4,
  returnAt: '2026-09-02T01:00:00.000Z',
  sequence: 1,
  time: '2026-08-29T01:00:00.000Z',
  transferVnd: 160_000,
  unitPriceVnd: 130_000,
  vehicleCodes: ['XE-001'],
};

describe('Feature: Revenue report — range and totals', () => {
  it('defaults to the current business month up to today', () => {
    expect(defaultReportRange(new Date('2026-09-10T03:00:00.000Z'))).toEqual({
      from: '2026-09-01',
      to: '2026-09-10',
    });
    expect(defaultReportRange(new Date('2026-09-30T17:30:00.000Z'))).toEqual({
      from: '2026-10-01',
      to: '2026-10-01',
    });
  });

  it('mirrors the API range rule so the export link is never offered for a rejected range', () => {
    expect(rangeIssue({ from: '2026-09-01', to: '2026-09-10' })).toBeNull();
    expect(rangeIssue({ from: '2026-09-01', to: '2026-09-01' })).toBeNull();
    expect(rangeIssue({ from: '2026-09-10', to: '2026-09-01' })).toBe('order');
    expect(rangeIssue({ from: '', to: '2026-09-01' })).toBe('invalid');
    expect(rangeIssue({ from: '2026-06-01', to: '2026-08-31' })).toBeNull();
    expect(rangeIssue({ from: '2026-06-01', to: '2026-09-01' })).toBe('span');
  });

  it('shares gross receipts by method and reads the tallest daily bar', () => {
    expect(collectionShare(TOTALS, TOTALS.cashVnd)).toBe(22);
    expect(collectionShare(TOTALS, TOTALS.transferVnd)).toBe(78);
    expect(collectionShare({ ...TOTALS, cashVnd: 0, transferVnd: 0 }, 0)).toBe(0);
    expect(maxDailyNet([])).toBe(0);
    expect(agingLabelKey('DAYS_8_30')).toBe('reportAgingBucket.DAYS_8_30');
  });
});

describe('Feature: Revenue report — table rows', () => {
  it('labels daily rows with the business calendar day and employees by name', () => {
    const daily = dailyMoneyRows(
      [
        {
          cashVnd: 0,
          day: '2026-09-01',
          netVnd: 350_000,
          paymentCount: 1,
          refundVnd: 0,
          transferVnd: 350_000,
        },
      ],
      'vi',
    );
    expect(daily).toEqual([
      {
        cash: vnd(0),
        key: '2026-09-01',
        label: '01/09/2026',
        net: vnd(350_000),
        netVnd: 350_000,
        paymentCount: 1,
        refund: vnd(0),
        transfer: vnd(350_000),
      },
    ]);
    expect(maxDailyNet([{ ...daily[0], day: '2026-09-01' } as never])).toBe(350_000);
    const employees = employeeMoneyRows(
      [
        {
          cashVnd: 100_000,
          employeeId: 'staff-1',
          employeeName: 'Nhân viên',
          netVnd: 100_000,
          paymentCount: 1,
          refundVnd: 0,
          transferVnd: 0,
        },
      ],
      'vi',
    );
    expect(employees[0]).toMatchObject({ key: 'staff-1', label: 'Nhân viên', net: vnd(100_000) });
  });

  it('renders the 14 approved columns in the client order with locale-aware values', () => {
    const cells = contractRowCells(ROW, 'vi');
    expect(cells.map((cell) => cell.key)).toEqual([...REPORT_COLUMN_KEYS]);
    expect(cells.map((cell) => cell.value)).toEqual([
      '1',
      'Khách hàng mẫu',
      '0900 000 001',
      cells[3]?.value ?? '',
      '02/09/2026',
      'XE-001',
      '4',
      vnd(130_000),
      vnd(160_000),
      vnd(100_000),
      'Cọc 500.000 ₫ · CCCD 0000',
      'Cửa hàng',
      'Nhân viên',
      'Thu lần 1',
    ]);
    expect(cells[3]?.value).toContain('29/08/2026');
    expect(contractRowCells({ ...ROW, returnAt: null }, 'vi')[4]?.value).toBe('');
  });
});
