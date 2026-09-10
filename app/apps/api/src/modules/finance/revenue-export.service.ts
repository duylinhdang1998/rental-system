import { Injectable } from '@nestjs/common';
import {
  REPORT_COLUMNS,
  businessDayKey,
  type ReportContractRow,
  type RevenueReport,
} from '@rental/contracts';
import { encodeWorkbook, type SheetCell } from './xlsx-writer.js';

export const REPORT_SHEET_NAME = 'Doanh thu';
const TOTAL_LABEL = 'Tổng cộng';
const TIME_ZONE = 'Asia/Ho_Chi_Minh';

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  timeZone: TIME_ZONE,
  year: 'numeric',
});

function stamp(value: string | null): string {
  return value ? timeFormatter.format(new Date(value)) : '';
}

/** The approved 14-column client layout, one line per contract; money stays numeric. */
export function exportRow(row: ReportContractRow): SheetCell[] {
  return [
    row.sequence,
    row.customerName,
    row.contact,
    stamp(row.time),
    row.returnAt ? businessDayKey(row.returnAt) : '',
    row.vehicleCodes.join(', '),
    row.rentalDays,
    row.unitPriceVnd,
    row.transferVnd,
    row.cashVnd,
    row.depositOrDocument,
    row.address,
    row.employeeName,
    row.notes,
  ];
}

export function exportRows(report: RevenueReport): SheetCell[][] {
  const header: SheetCell[] = [...REPORT_COLUMNS];
  const body = report.rows.map(exportRow);
  const totals: SheetCell[] = REPORT_COLUMNS.map(() => null);
  totals[1] = TOTAL_LABEL;
  totals[REPORT_COLUMNS.indexOf('Chuyển khoản')] = report.rows.reduce(
    (sum, row) => sum + row.transferVnd,
    0,
  );
  totals[REPORT_COLUMNS.indexOf('Tiền mặt')] = report.rows.reduce(
    (sum, row) => sum + row.cashVnd,
    0,
  );
  return [header, ...body, totals];
}

export function exportFileName(report: Pick<RevenueReport, 'from' | 'to'>): string {
  return `doanh-thu-${report.from}-${report.to}.xlsx`;
}

@Injectable()
export class RevenueExportService {
  workbook(report: RevenueReport): Buffer {
    return encodeWorkbook(
      { rows: exportRows(report), sheetName: REPORT_SHEET_NAME },
      new Date(report.generatedAt),
    );
  }
}
