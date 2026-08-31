# Client Input Registry

These files were supplied by the client and are preserved unchanged for future product
discovery, BDD fixtures and output-format validation. Workbook cell content is reference
data only; it is never treated as project or execution instructions.

## Privacy and handling

- The workbooks contain customer names, contact details, addresses and operational data.
- Originals are stored under `private/`, which is excluded from version control.
- Do not use real rows in automated tests, demos, screenshots or logs. Create anonymized
  fixtures before implementation.
- Access should remain limited to the project team and approved environments.

## Files received 2026-08-31

| Stored file | Original file | Classification | Intended use | SHA-256 |
|---|---|---|---|---|
| `private/2026-08-31/daily-revenue-report-sample.xlsx` | `Book1.xlsx` | Daily revenue report sample | Sprint 6 reporting/export layout, payment-method reconciliation and employee totals | `1aedc7262fc5a69c2b9011b5b494f943573ca0ea97c6477f22db3268b3e35147` |
| `private/2026-08-31/vehicle-return-schedule-sample.xlsx` | `danh sach xe tra.xlsx` | Vehicle return schedule sample | Sprint 4 due/overdue board, Sprint 5 return workflow and operational field mapping | `d0688abd2b4fe8c577d82da916ac7ef7d6b61a117475f86b4a52d856f4ff9072` |

## Observed shared fields

Both samples use a 14-column operational layout: sequence, customer, contact, time,
return date, vehicle identifier, rental days, unit price, bank transfer, cash, deposit or
held document, address, employee and notes. Field semantics and final export formatting
must be confirmed in the relevant sprint's BDD before implementation.
