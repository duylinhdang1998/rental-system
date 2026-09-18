import { Injectable } from '@nestjs/common';
import { PNL_COLUMNS, PNL_SHEET_NAME, type PnlMonth, type PnlReport } from '@rental/contracts';
import { encodeWorkbook, type SheetCell } from '../finance/xlsx-writer.js';

const TOTAL_LABEL = 'Tổng cộng';

export function exportPnlRow(row: PnlMonth): SheetCell[] {
  return [row.month, row.revenueVnd, row.expensesVnd, row.depreciationVnd, row.profitVnd];
}

export function exportPnlRows(report: PnlReport): SheetCell[][] {
  const { totals } = report;
  return [
    [...PNL_COLUMNS],
    ...report.months.map(exportPnlRow),
    [TOTAL_LABEL, totals.revenueVnd, totals.expensesVnd, totals.depreciationVnd, totals.profitVnd],
  ];
}

export function pnlExportFileName(report: Pick<PnlReport, 'from' | 'to'>): string {
  return `lai-lo-${report.from}-${report.to}.xlsx`;
}

@Injectable()
export class PnlExportService {
  workbook(report: PnlReport): Buffer {
    return encodeWorkbook(
      { rows: exportPnlRows(report), sheetName: PNL_SHEET_NAME },
      new Date(report.generatedAt),
    );
  }
}
