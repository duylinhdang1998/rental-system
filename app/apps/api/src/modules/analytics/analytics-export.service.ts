import { Injectable } from '@nestjs/common';
import {
  ANALYTICS_SHEETS,
  type AnalyticsReport,
  type ChargeKind,
  type DimensionRow,
  type UtilisationRow,
} from '@rental/contracts';
import { encodeSheets, type Sheet, type SheetCell } from '../finance/xlsx-writer.js';

const TOTAL_LABEL = 'Tổng cộng';
const NET_LABEL = 'Ròng';
const FLEET_LABEL = 'Toàn đội';

export const SURCHARGE_LABELS: Record<ChargeKind, string> = {
  DAMAGE: 'Hư hỏng',
  DISCOUNT: 'Giảm giá',
  LATE_RETURN: 'Trả trễ',
  OTHER: 'Khác',
};

function dimensionSheet(
  layout: { columns: readonly string[]; name: string },
  rows: readonly DimensionRow[],
  totals: AnalyticsReport['totals'],
): Sheet {
  const body: SheetCell[][] = rows.map((row) => [
    row.label,
    row.revenueVnd,
    row.rentalDays,
    row.contractCount,
    row.sharePercent,
  ]);
  const total: SheetCell[] = [
    TOTAL_LABEL,
    totals.revenueVnd,
    totals.rentalDays,
    totals.contractCount,
    null,
  ];
  return { name: layout.name, rows: [[...layout.columns], ...body, total] };
}

function monthSheet(report: AnalyticsReport): Sheet {
  const rows: SheetCell[][] = report.byMonth.map((row) => [
    row.month,
    row.revenueVnd,
    row.rentalDays,
    row.contractCount,
  ]);
  return {
    name: ANALYTICS_SHEETS.month.name,
    rows: [[...ANALYTICS_SHEETS.month.columns], ...rows],
  };
}

function surchargeSheet(report: AnalyticsReport): Sheet {
  const rows: SheetCell[][] = report.surcharges.map((row) => [
    SURCHARGE_LABELS[row.kind],
    row.count,
    row.amountVnd,
  ]);
  const net: SheetCell[] = [NET_LABEL, null, report.totals.surchargeNetVnd];
  return {
    name: ANALYTICS_SHEETS.surcharges.name,
    rows: [[...ANALYTICS_SHEETS.surcharges.columns], ...rows, net],
  };
}

function utilisationCells(row: UtilisationRow, label = row.label): SheetCell[] {
  return [label, row.rentedDays, row.availableDays, row.utilisationPercent];
}

function utilisationSheet(report: AnalyticsReport): Sheet {
  const { byType, byVehicle, fleet } = report.utilisation;
  return {
    name: ANALYTICS_SHEETS.utilisation.name,
    rows: [
      [...ANALYTICS_SHEETS.utilisation.columns],
      ...byVehicle.map((row) => utilisationCells(row)),
      ...byType.map((row) => utilisationCells(row)),
      utilisationCells({ ...fleet, key: 'fleet', label: FLEET_LABEL }),
    ],
  };
}

export function exportAnalyticsSheets(report: AnalyticsReport): Sheet[] {
  return [
    dimensionSheet(ANALYTICS_SHEETS.type, report.byType, report.totals),
    dimensionSheet(ANALYTICS_SHEETS.vehicle, report.byVehicle, report.totals),
    dimensionSheet(ANALYTICS_SHEETS.nationality, report.byNationality, report.totals),
    monthSheet(report),
    surchargeSheet(report),
    utilisationSheet(report),
  ];
}

export function analyticsExportFileName(report: Pick<AnalyticsReport, 'from' | 'to'>): string {
  return `phan-tich-${report.from}-${report.to}.xlsx`;
}

@Injectable()
export class AnalyticsExportService {
  workbook(report: AnalyticsReport): Buffer {
    return encodeSheets(exportAnalyticsSheets(report), new Date(report.generatedAt));
  }
}
