import type { PnlMonth, Utilisation } from '@rental/contracts';
import { describe, expect, it } from 'vitest';
import {
  analyticsRangeIssue,
  analyticsTotalCards,
  defaultAnalyticsRange,
  dimensionCells,
  monthCells,
  monthLabel,
  monthSeries,
  signedCurrency,
  surchargeCells,
  utilisationTableRows,
} from '../../apps/admin/src/features/reporting/lib/analytics-presentation';
import {
  chartGeometry,
  niceStep,
} from '../../apps/admin/src/features/reporting/lib/chart-geometry';
import {
  PNL_COLUMN_KEYS,
  defaultPnlQuery,
  pnlIssue,
  pnlMonthOptions,
  pnlRowCells,
  pnlSeries,
  pnlTotalCards,
  pnlTotalCells,
} from '../../apps/admin/src/features/reporting/lib/pnl-presentation';
import { formatCurrency } from '../../apps/admin/src/shared/i18n/locale';

const vnd = (value: number) => formatCurrency(value, 'vi');
const MINUS = '−';

const UTILISATION: Utilisation = {
  byType: [
    {
      availableDays: 62,
      key: 'SCOOTER',
      label: 'Xe tay ga',
      rentedDays: 7,
      utilisationPercent: 11,
    },
  ],
  byVehicle: [
    {
      availableDays: 31,
      key: 'vehicle-001',
      label: 'XE-001',
      rentedDays: 3,
      utilisationPercent: 9,
    },
    {
      availableDays: 31,
      key: 'vehicle-002',
      label: 'XE-002',
      rentedDays: 4,
      utilisationPercent: 12,
    },
  ],
  fleet: { availableDays: 62, rentedDays: 7, utilisationPercent: 11 },
};

const SEPTEMBER: PnlMonth = {
  depreciationVnd: 750_000,
  expensesVnd: 0,
  month: '2026-09',
  profitVnd: -180_000,
  revenueVnd: 570_000,
};

describe('Feature: Analytics page — range and cells', () => {
  it('defaults to twelve business months ending today and mirrors the 366-day rule', () => {
    expect(defaultAnalyticsRange(new Date('2026-09-10T03:00:00.000Z'))).toEqual({
      from: '2025-10-01',
      to: '2026-09-10',
    });
    expect(defaultAnalyticsRange(new Date('2026-01-05T03:00:00.000Z'))).toEqual({
      from: '2025-02-01',
      to: '2026-01-05',
    });
    expect(analyticsRangeIssue({ from: '2025-09-18', to: '2026-09-18' })).toBeNull();
    expect(analyticsRangeIssue({ from: '2025-09-17', to: '2026-09-18' })).toBe('span');
    expect(analyticsRangeIssue({ from: '2025-01-01', to: '2026-09-18' })).toBe('span');
    expect(analyticsRangeIssue({ from: '2026-09-18', to: '2026-09-17' })).toBe('order');
  });

  it('renders dimension, month and surcharge rows with a true minus sign for negatives', () => {
    expect(
      dimensionCells(
        {
          contractCount: 1,
          key: 'SCOOTER',
          label: 'Xe tay ga',
          rentalDays: 4,
          revenueVnd: 560_000,
          sharePercent: 98,
        },
        'vi',
        'Chưa phân bổ',
      ),
    ).toEqual({
      contracts: '1',
      key: 'SCOOTER',
      label: 'Xe tay ga',
      rentalDays: '4',
      revenue: vnd(560_000),
      share: 98,
      unallocated: false,
    });
    const unallocated = dimensionCells(
      {
        contractCount: 1,
        key: 'unallocated',
        label: 'x',
        rentalDays: 0,
        revenueVnd: -10_000,
        sharePercent: 0,
      },
      'vi',
      'Chưa phân bổ',
    );
    expect(unallocated).toMatchObject({
      label: 'Chưa phân bổ',
      rentalDays: '—',
      unallocated: true,
    });
    expect(unallocated.revenue).toBe(`${MINUS}${vnd(10_000)}`);
    expect(
      monthCells({ contractCount: 2, month: '2026-09', rentalDays: 5, revenueVnd: 1 }, 'vi'),
    ).toEqual({
      contracts: '2',
      key: '2026-09',
      month: '09/2026',
      rentalDays: '5',
      revenue: vnd(1),
    });
    expect(surchargeCells({ amountVnd: 40_000, count: 1, kind: 'OTHER' }, 'vi')).toEqual({
      amount: vnd(40_000),
      count: '1',
      kind: 'OTHER',
    });
    expect(monthLabel('2026-01')).toBe('01/2026');
    expect(signedCurrency(0, 'vi')).toBe(vnd(0));
  });

  it('lists utilisation vehicles first, then types, then the whole fleet', () => {
    const rows = utilisationTableRows(UTILISATION, 'Toàn đội');
    expect(rows.map((row) => [row.label, row.days, row.percent, row.emphasis])).toEqual([
      ['XE-001', '3/31', 9, false],
      ['XE-002', '4/31', 12, false],
      ['Xe tay ga', '7/62', 11, true],
      ['Toàn đội', '7/62', 11, true],
    ]);
  });

  it('builds four KPI cards and the month series', () => {
    const cards = analyticsTotalCards(
      {
        contractCount: 3,
        rentalDays: 9,
        revenueVnd: 570_000,
        surchargeNetVnd: -5_000,
        unallocatedVnd: 0,
      },
      'vi',
    );
    expect(cards.map((card) => [card.key, card.value])).toEqual([
      ['revenueVnd', vnd(570_000)],
      ['rentalDays', '9'],
      ['surchargeNetVnd', `${MINUS}${vnd(5_000)}`],
      ['unallocatedVnd', vnd(0)],
    ]);
    expect(cards[0]?.contextParams).toEqual({ count: 3 });
    expect(
      monthSeries([
        { contractCount: 1, month: '2026-08', rentalDays: 1, revenueVnd: 300_000 },
        { contractCount: 1, month: '2026-09', rentalDays: 4, revenueVnd: 570_000 },
      ]),
    ).toEqual({ labels: ['08/2026', '09/2026'], values: [300_000, 570_000] });
  });
});

describe('Scenario Outline: The chart geometry is pure and handles empty, flat and negative series', () => {
  it.each([
    [[], 200, 200],
    [[0, 0, 0], 200, 200],
    [[100, 200], 200, 120],
    [[-100, 100], 120, 200],
  ])('series %j → zero line %i, first point %i', (values, zeroY, firstY) => {
    const labels = values.map((_, index) => `L${index}`);
    const geometry = chartGeometry(labels, [{ key: 'a', values }]);
    expect(geometry.zeroY).toBe(zeroY);
    expect(geometry.lines[0]?.points[0]?.y ?? zeroY).toBe(firstY);
    expect(geometry.xLabels).toHaveLength(labels.length);
  });

  it('spaces points across the plot, picks 1/2/5 ticks and thins labels beyond twelve', () => {
    const geometry = chartGeometry(['a', 'b', 'c'], [{ key: 'r', values: [0, 570_000, 285_000] }]);
    expect(geometry.lines[0]?.points.map((point) => point.x)).toEqual([64, 324, 584]);
    expect(geometry.lines[0]?.path).toBe('M64 200 L324 40 L584 120');
    expect(geometry.ticks.map((tick) => tick.value)).toEqual([0, 200_000, 400_000]);
    expect(niceStep(570_000)).toBe(200_000);
    expect(niceStep(0)).toBe(1);
    expect(niceStep(40)).toBe(10);
    const thirteen = Array.from({ length: 13 }, (_, index) => `M${index}`);
    expect(chartGeometry(thirteen, []).xLabels).toHaveLength(7);
    expect(chartGeometry(['only'], [{ key: 'r', values: [5] }]).lines[0]?.points[0]?.x).toBe(324);
  });
});

describe('Feature: Profit and loss page — query and cells', () => {
  it('defaults to twelve months ending the current business month and validates the query', () => {
    expect(defaultPnlQuery(new Date('2026-09-30T17:30:00.000Z'))).toEqual({
      months: '12',
      to: '2026-10',
    });
    expect(pnlIssue({ months: '12', to: '2026-09' })).toBeNull();
    expect(pnlIssue({ months: '12', to: '2026-9' })).toBe('invalid');
    expect(pnlIssue({ months: '7', to: '2026-09' })).toBe('invalid');
    expect(pnlMonthOptions((count) => `${count} tháng`)).toEqual([
      { label: '6 tháng', value: '6' },
      { label: '12 tháng', value: '12' },
      { label: '24 tháng', value: '24' },
    ]);
  });

  it('renders month rows, the totals row, the KPI cards and three chart series', () => {
    const cells = pnlRowCells(SEPTEMBER, 'vi');
    expect(cells.map((cell) => cell.key)).toEqual([...PNL_COLUMN_KEYS]);
    expect(cells.map((cell) => cell.value)).toEqual([
      '09/2026',
      vnd(570_000),
      vnd(0),
      vnd(750_000),
      `${MINUS}${vnd(180_000)}`,
    ]);
    const totals = {
      depreciationVnd: 750_000,
      expensesVnd: 0,
      profitVnd: -180_000,
      revenueVnd: 570_000,
    };
    expect(pnlTotalCells(totals, 'vi', 'Tổng')[0]).toEqual({ key: 'month', value: 'Tổng' });
    expect(pnlTotalCards(totals, 'vi').map((card) => card.key)).toEqual([
      'revenueVnd',
      'expensesVnd',
      'depreciationVnd',
      'profitVnd',
    ]);
    expect(pnlSeries([SEPTEMBER])).toEqual({
      labels: ['09/2026'],
      series: [
        { key: 'revenueVnd', values: [570_000] },
        { key: 'expensesVnd', values: [0] },
        { key: 'profitVnd', values: [-180_000] },
      ],
    });
  });
});
