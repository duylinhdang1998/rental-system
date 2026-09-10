import { Inject, Injectable } from '@nestjs/common';
import type { ReportRange, RevenueReport } from '@rental/contracts';
import { EmployeeDirectory } from '../auth/employee-directory.js';
import { CONTRACT_REPOSITORY } from '../contracts/contract.tokens.js';
import type { ContractRepository } from '../contracts/contract.types.js';
import { CUSTOMER_REPOSITORY } from '../customers/customer.tokens.js';
import type { CustomerRepository } from '../customers/customer.types.js';
import { receivableAging, receivableList } from './receivable.policy.js';
import { reportWindow } from './report-range.js';
import {
  contractRows,
  dailyRows,
  employeeRows,
  paymentsInWindow,
  revenueTotals,
  type PaymentRow,
} from './revenue-report.policy.js';

/** US-019 / BR-08: period revenue by day, employee and contract plus receivable aging (Owner only). */
@Injectable()
export class RevenueReportService {
  constructor(
    @Inject(CONTRACT_REPOSITORY) private readonly contracts: ContractRepository,
    @Inject(CUSTOMER_REPOSITORY) private readonly customers: CustomerRepository,
    private readonly employees: EmployeeDirectory,
  ) {}

  async revenue(range: ReportRange, now = new Date()): Promise<RevenueReport> {
    const window = reportWindow(range);
    const contracts = await this.contracts.listFinancial();
    const rows = paymentsInWindow(contracts, window);
    const names = await this.employees.names(rows.map((row) => row.payment.receivedById));
    const contacts = await this.contacts(rows);
    return {
      aging: receivableAging(receivableList(contracts, now).items),
      days: dailyRows(rows),
      employees: employeeRows(rows, names),
      from: window.from,
      generatedAt: now.toISOString(),
      rows: contractRows(rows, { contacts, names }),
      timeZone: window.timeZone,
      to: window.to,
      totals: revenueTotals(rows),
    };
  }

  /** Primary contact per customer for the export layout; missing customers leave the cell blank. */
  private async contacts(rows: readonly PaymentRow[]): Promise<Map<string, string>> {
    const ids = [...new Set(rows.map((row) => row.contract.customerId))];
    const customers = await Promise.all(ids.map((id) => this.customers.findById(id)));
    return new Map(
      customers.flatMap((customer) => {
        if (!customer) return [];
        const primary =
          customer.contacts.find((contact) => contact.primary) ?? customer.contacts[0];
        return [[customer.id, primary?.value ?? ''] satisfies [string, string]];
      }),
    );
  }
}
