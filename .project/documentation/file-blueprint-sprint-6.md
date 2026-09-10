# Sprint 6 Exact File Blueprint — Payments, Receivables and Reporting

**Status:** APPROVED — reconciled with the Sprint 6 implementation on 2026-09-10 (after code review)
**Architecture:** Extend the approved modular NestJS + React SPA monolith. Payments are part of
the contract aggregate (an append-only ledger next to charges and the settlement), so the
settlement statement, the receivable list and the revenue report all read the same rows. Money
math stays in the shared contracts package; every write is one Serializable transaction plus an
immutable contract event and an audit entry. Reporting is a new read-only module that imports
the contract and customer repository ports; the Excel writer is a dependency-free minimal OOXML
encoder. No new service boundary and no new persistence technology.

## Shared contracts and persistence

```text
app/packages/contracts/src/
├── payments.ts                             # PaymentKind/PaymentMethod enums, ContractPaymentInput, ContractPayment
├── finance.ts                              # PaymentBalance, LedgerEntry, ContractLedger, ReceivableItem/List
├── reporting.ts                            # MAX_REPORT_DAYS, report range, daily/employee rows, aging, 14 REPORT_COLUMNS
├── payment-balance.ts                      # netPaid / remainingReceivable / paymentCap / paymentBalance (BR-04, shared)
├── contracts.ts                            # payments[] on the contract, PAYMENT_RECORDED / REFUND_RECORDED events
└── index.ts                                # Public exports

app/apps/api/prisma/
├── schema.prisma                           # ContractPayment, PaymentKind/PaymentMethod enums, new event types
└── migrations/202609100002_payment_ledger/migration.sql # Forward migration (append-only table, unique idempotency key)
```

## Backend — contracts module (ledger), auth directory, finance module (receivables, reports)

```text
app/apps/api/src/modules/contracts/
├── contract.module.ts                      # Registers the payment controller/service; exports CONTRACT_REPOSITORY
├── contract-payment.controller.ts          # POST :id/payments (CSRF), GET :id/ledger
├── contract-payment.service.ts             # US-018: caps, idempotent replay (same key + amount + kind), refund, event + audit
├── contract-payment.policy.ts              # Pure ledger helpers: PAYABLE_CONTRACT_STATUSES, balance, caps, last receipt
├── contract-settlement.service.ts          # Statement and settlement read paidVnd from the ledger
├── contract.types.ts                       # PaymentDraft; repository port: addPayment, findByPaymentKey, listFinancial
├── demo-contract.builders.ts               # buildPayment synthetic builder
├── demo-contract.repository.ts             # In-memory addPayment/findByPaymentKey/listFinancial
├── demo-contract.seed.ts                   # Seeds carry an empty ledger
├── prisma-contract.mapper.ts               # payments in CONTRACT_INCLUDE, mapPayment, mapQuote
├── prisma-payment.writes.ts                # writePayment transaction body (payment + event)
└── prisma-contract.repository.ts           # Serializable addPayment with unique-key replay, findByPaymentKey, listFinancial

app/apps/api/src/modules/auth/
├── auth.module.ts                          # Provides and exports EmployeeDirectory
└── employee-directory.ts                   # Resolves account ids to display names (ledger cashier, report employee rows)

app/apps/api/src/modules/customers/
├── customer.module.ts                      # Exports CUSTOMER_REPOSITORY for the finance module
├── customer.types.ts                       # findById on the repository port (report contact column)
├── demo-customer.repository.ts             # In-memory findById
└── prisma-customer.repository.ts           # Prisma findById

app/apps/api/src/modules/finance/
├── finance.module.ts                       # register(contracts, customers): shares the app's module instances
├── finance.controller.ts                   # GET finance/receivables (both roles)
├── receivable.service.ts                   # Open receivables across contracts
├── receivable.policy.ts                    # Pure: due date rule, business-day age, ordering, aging buckets
├── report.controller.ts                    # GET reports/revenue, GET reports/revenue/export (Owner only)
├── revenue-report.service.ts               # US-019: period report (daily, employee, aging, contract rows, contacts)
├── revenue-report.policy.ts                # Pure: window filter, business-day grouping, totals, 14-column rows
├── report-range.ts                         # Range validation (calendar validity, order, < 92 days) in business time
├── revenue-export.service.ts               # "Doanh thu" sheet: header, one row per contract, totals row, file name
└── xlsx-writer.ts                          # Minimal OOXML workbook encoder (deflate ZIP entries, inline strings)

app/apps/api/src/app.module.ts              # Registers FinanceModule with the same Contract/Customer module instances
```

## Frontend — contracts, finance and reporting features

```text
app/apps/admin/src/
├── App.tsx                                 # /receivables live (both roles); /reports renders the live report (Owner route)
├── shared/navigation/routes.ts             # "Công nợ" item for both roles
├── shared/i18n/i18n.ts                     # Registers payment, finance and report translations
├── features/contracts/
│   ├── index.ts                            # Exports ContractPaymentDialog for the finance feature
│   ├── api/contracts-api.ts                # fetchLedger, recordPayment
│   ├── hooks/use-ledger.ts                 # Ledger query
│   ├── hooks/use-record-payment.ts         # Payment mutation for any contract (receivable list)
│   ├── hooks/use-payment-form.ts           # Form state with one idempotency key per dialog instance
│   ├── hooks/use-contract-mutation.ts      # Invalidates ledger, receivables, report, queue and board queries
│   ├── hooks/use-contract-mutations.ts     # payment mutation on the detail page
│   ├── hooks/use-contract-detail-page.ts   # ledger + open receivable flag; ContractDetailPageState type
│   ├── lib/contract-presentation.ts        # "payment" action, showsLedger, payment/refund event describers
│   ├── lib/contract-translations.ts        # PAYMENT_RECORDED / REFUND_RECORDED event labels
│   ├── lib/payment-presentation.ts         # Form values, caps, ledger/balance rows, method labels, receivable tones
│   ├── lib/payment-translations.ts         # Vietnamese/English copy for ledger and dialog
│   ├── lib/settlement-translations.ts      # Pending-ledger note removed
│   ├── components/detail/ContractActions.tsx      # Thu tiền button (also after settlement while owed)
│   ├── components/detail/ContractDetailBody.tsx   # Ledger panel placement (hidden for cancelled contracts)
│   ├── components/detail/ContractDetailContent.tsx # Header, actions, body and dialogs for a loaded contract
│   ├── components/detail/TimelineEvent.tsx        # Payment/refund icons and tones
│   ├── components/lifecycle/LifecycleDialogs.tsx  # Routes the payment dialog with the ledger balance
│   ├── components/payments/LedgerPanel.tsx        # Balance + entries
│   ├── components/payments/LedgerBalance.tsx      # Paid / cash / transfer / refunded / remaining
│   ├── components/payments/LedgerEntryList.tsx    # Append-only entries
│   ├── components/payments/LedgerEntryItem.tsx    # One signed entry with method, cashier and reference
│   ├── components/payments/PaymentDialog.tsx      # "Thu tiền" dialog bound to a contract mutation
│   ├── components/payments/ContractPaymentDialog.tsx # Same dialog for a receivable row (own mutation)
│   ├── components/payments/PaymentKindField.tsx   # Collection or refund, explicit (BR-04)
│   ├── components/payments/PaymentAmountFields.tsx # Amount with cap hint
│   ├── components/payments/PaymentMethodFields.tsx # Cash / bank transfer, reference, notes
│   ├── components/settlement/SettlementFigureList.tsx # Pending-ledger note removed
│   └── pages/ContractDetailPage.tsx        # Loading/error states, then ContractDetailContent
├── features/finance/
│   ├── index.ts
│   ├── api/finance-api.ts                  # fetchReceivables
│   ├── hooks/use-receivables.ts
│   ├── hooks/use-receivable-page.ts        # Query + selected receivable for the collect dialog
│   ├── lib/receivable-presentation.ts      # Highlights, day counts, tones, row mapping
│   ├── lib/finance-translations.ts
│   ├── pages/ReceivableListPage.tsx
│   └── components/list/
│       ├── ReceivableHeader.tsx
│       ├── ReceivableSummary.tsx
│       ├── ReceivableList.tsx              # Table on desktop, cards on mobile
│       ├── ReceivableTable.tsx
│       ├── ReceivableTableRow.tsx
│       ├── ReceivableCard.tsx
│       ├── ReceivableAgeBadge.tsx
│       └── ReceivableCollectButton.tsx
└── features/reporting/
    ├── index.ts                            # ReportPage replaces ReportPreview (removed)
    ├── api/report-api.ts                   # fetchRevenueReport, revenueExportUrl
    ├── hooks/use-revenue-report.ts
    ├── hooks/use-report-page.ts            # Month-to-date default, range issue, query enabled only when valid
    ├── lib/report-presentation.ts          # Default range, range issue (mirrors API rule), shares, rows, 14 cells
    ├── lib/report-translations.ts
    ├── pages/ReportPage.tsx
    └── components/
        ├── summary/ReportHeader.tsx
        ├── summary/ReportTotals.tsx        # Net, cash, transfer, refunds KPI cards
        ├── filters/ReportRangeForm.tsx     # From/to dates with role="alert" issue text
        ├── filters/ReportExportButton.tsx  # Disabled button or <a download> to the export route
        ├── layout/ReportBody.tsx           # Loading/error/issue states
        ├── layout/ReportContent.tsx        # Totals, money tables or empty text, aging, contract table
        ├── layout/ReportMoneyTables.tsx    # Daily and employee tables
        ├── tables/ReportMoneyTable.tsx
        ├── tables/ReportMoneyRow.tsx       # Progress bar against the tallest day
        ├── tables/ReportAgingList.tsx
        ├── tables/ReportContractTable.tsx  # Client 14-column layout
        └── tables/ReportContractLine.tsx
```

## Tests

```text
app/tests/domain/contract-payment.test.ts             # Balance/caps golden examples, statement with ledger paid, receivables, aging
app/tests/domain/revenue-report.test.ts               # Range rule, business-day grouping, totals, employee rows, export rows, xlsx bytes
app/tests/domain/support/contract-fixture.ts          # paymentFixture, payments on contractFixture
app/tests/domain/support/xlsx-reader.ts               # Minimal ZIP/OOXML reader used only by tests
app/tests/api/contract-payments.test.ts               # Ledger, caps, idempotent replay, refund, after settlement, cancelled
app/tests/api/finance-reporting.test.ts               # Receivables, Owner-only report/export, golden totals, range validation
app/tests/infrastructure/prisma-sprint6.repositories.test.ts # Payment write + event, unique-key race, listFinancial, customer findById
app/tests/infrastructure/prisma-sprint{3,4,5}.repositories.test.ts # Fixtures carry the payments relation
app/tests/admin/payment-presentation.test.ts          # Caps, form mapping, signed figures, balance rows, receivable tones
app/tests/admin/report-presentation.test.ts           # Default range, range issue, shares, rows, 14 cells
app/tests/admin/contract-presentation.test.ts         # Payment action per status
app/tests/admin/settlement-presentation.test.ts       # Payment action after settlement while owed
app/tests/admin/navigation.test.tsx                   # /receivables for both roles
app/e2e/support/contracts.ts                          # recordPayment helper
app/e2e/finance-reporting.spec.ts                     # Staff detail-page collection; Staff receivable list + Owner-only API; Owner report + export
app/e2e/contract-creation.spec.ts                     # Conflict test uses its own rental window
app/e2e/workspace-navigation.spec.ts                  # /reports and /receivables are live routes
```

## Guardrails

- Ledger rows are never updated or deleted; the API exposes no such route and the Prisma model
  has no update path (BR-07).
- Every payment write is one Serializable transaction (payment + contract event); an audit entry
  follows. Replaying the same idempotency key with the same contract, amount and kind returns the
  stored contract; reusing the key differently answers 409. A concurrent replay that loses the
  unique-index race returns the stored row instead of failing.
- Revenue aggregates are Owner-only: `OwnerAuthorizationGuard` on the report controller and the
  `OwnerRoute` wrapper in the SPA (BR-08). The receivable list is operational and open to Staff.
- A contract owes money only once its rental ended or its vehicles came back; CONFIRMED bookings
  and cancelled contracts never enter the receivable list.
- Business-day grouping uses `businessDayKey` (Asia/Ho_Chi_Minh) on UTC timestamps; the report
  window is `[from 00:00, to 24:00)` in business time and spans fewer than 92 days.
- The Excel writer emits numeric cells for money and inline strings for text; no third-party
  spreadsheet dependency is added (PD-13).
- Private client workbooks stay outside Git; all fixtures, seeds and screenshots are synthetic.
