import { Injectable } from '@nestjs/common';
import type { RentalContract } from '@rental/contracts';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const TITLE_Y = 780;
const BODY_Y = 740;
const LINE_HEIGHT = 28;
const PAGE_MARGIN = 58;
const TITLE_SIZE = 16;
const BODY_SIZE = 10;
const TITLE_RED = 0.1;
const TITLE_GREEN = 0.2;
const TITLE_BLUE = 0.25;
const TITLE_COLOR = rgb(TITLE_RED, TITLE_GREEN, TITLE_BLUE);

function pdfSafeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function pdfLines(contract: RentalContract): string[] {
  return [
    `Ma hop dong / Contract code: ${contract.code}`,
    `Khach hang / Customer: ${contract.quote.customerName}`,
    `Thoi gian / Rental period: ${contract.quote.startAt} - ${contract.quote.endAt}`,
    `Xe / Vehicles: ${contract.quote.lines.map((line) => line.vehicleCode).join(', ')}`,
    `Tong tien / Total: ${contract.quote.totalVnd.toLocaleString('vi-VN')} VND`,
    `Tien coc / Deposit: ${contract.handover.depositVnd.toLocaleString('vi-VN')} VND`,
    '',
    'Dieu khoan tieng Viet / Vietnamese terms',
    'Gia va thoi gian duoc co dinh theo thong tin tai thoi diem tao hop dong.',
    '',
    'English terms',
    'Price and rental period are fixed from the confirmed contract snapshot.',
  ];
}

@Injectable()
export class ContractPdfService {
  async generate(contract: RentalContract): Promise<Uint8Array> {
    const document = await PDFDocument.create();
    const font = await document.embedFont(StandardFonts.Helvetica);
    const bold = await document.embedFont(StandardFonts.HelveticaBold);
    const page = document.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawText('HOP DONG THUE XE / VEHICLE RENTAL AGREEMENT', {
      color: TITLE_COLOR,
      font: bold,
      size: TITLE_SIZE,
      x: PAGE_MARGIN,
      y: TITLE_Y,
    });
    pdfLines(contract).forEach((line, index) =>
      page.drawText(pdfSafeText(line), {
        font,
        size: BODY_SIZE,
        x: PAGE_MARGIN,
        y: BODY_Y - index * LINE_HEIGHT,
      }),
    );
    return document.save();
  }
}
