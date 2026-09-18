import { Injectable } from '@nestjs/common';
import {
  FLEET_ECONOMICS_COLUMNS,
  type BreakEven,
  type FleetEconomicsReport,
  type FleetEconomicsRow,
} from '@rental/contracts';
import { encodeWorkbook, type SheetCell } from '../finance/xlsx-writer.js';

export const ECONOMICS_SHEET_NAME = 'Đội xe';
const UNALLOCATED_LABEL = 'Chưa phân bổ';
const TOTAL_LABEL = 'Tổng cộng';

export function breakEvenLabel(breakEven: BreakEven): string {
  switch (breakEven.status) {
    case 'RECOVERED':
      return 'Đã hòa vốn';
    case 'PROJECTED':
      return `Dự kiến ${breakEven.monthsRemaining ?? 0} tháng`;
    case 'NOT_PROJECTABLE':
      return 'Chưa dự báo được';
    default:
      return 'Chưa có giá vốn';
  }
}

/** One line per vehicle in the approved column order; money stays numeric. */
export function exportEconomicsRow(row: FleetEconomicsRow): SheetCell[] {
  return [
    row.code,
    row.plate,
    row.model,
    row.purchasePriceVnd,
    row.monthlyDepreciationVnd,
    row.accumulatedDepreciationVnd,
    row.bookValueVnd,
    row.revenueVnd,
    row.rentalDays,
    row.expensesVnd,
    row.netVnd,
    row.recoveredPercent,
    breakEvenLabel(row.breakEven),
    row.breakEven.projectedOn ?? '',
  ];
}

function blankRow(label: string): SheetCell[] {
  const cells: SheetCell[] = FLEET_ECONOMICS_COLUMNS.map(() => null);
  cells[0] = label;
  return cells;
}

function column(name: (typeof FLEET_ECONOMICS_COLUMNS)[number]): number {
  return FLEET_ECONOMICS_COLUMNS.indexOf(name);
}

export function exportEconomicsRows(report: FleetEconomicsReport): SheetCell[][] {
  const header: SheetCell[] = [...FLEET_ECONOMICS_COLUMNS];
  const { totals } = report;
  const unallocated = blankRow(UNALLOCATED_LABEL);
  unallocated[column('Doanh thu')] = totals.unallocatedRevenueVnd;
  unallocated[column('Chi phí')] = totals.unallocatedExpensesVnd;
  unallocated[column('Ròng')] = totals.unallocatedRevenueVnd - totals.unallocatedExpensesVnd;
  const total = blankRow(TOTAL_LABEL);
  total[column('Giá vốn')] = totals.purchasePriceVnd;
  total[column('Khấu hao lũy kế')] = totals.accumulatedDepreciationVnd;
  total[column('Giá trị còn lại')] = totals.bookValueVnd;
  total[column('Doanh thu')] = totals.revenueVnd;
  total[column('Ngày thuê')] = totals.rentalDays;
  total[column('Chi phí')] = totals.expensesVnd;
  total[column('Ròng')] = totals.netVnd;
  total[column('Hòa vốn')] = `${totals.vehiclesRecovered}/${totals.vehicleCount} xe`;
  return [header, ...report.rows.map(exportEconomicsRow), unallocated, total];
}

export function economicsExportFileName(report: Pick<FleetEconomicsReport, 'asOf'>): string {
  return `hieu-qua-doi-xe-${report.asOf}.xlsx`;
}

@Injectable()
export class FleetEconomicsExportService {
  workbook(report: FleetEconomicsReport): Buffer {
    return encodeWorkbook(
      { rows: exportEconomicsRows(report), sheetName: ECONOMICS_SHEET_NAME },
      new Date(report.generatedAt),
    );
  }
}
