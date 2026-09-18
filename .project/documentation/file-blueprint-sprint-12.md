# Sprint 12 Exact File Blueprint — Operations Finance

**Status:** RECONCILED with the delivered code (2026-09-18)  
**Architecture:** Three small additions over the existing ports. A `damage-catalog` module owns
the damage price list (Owner CRUD, exported repository so the contract module can price charges).
A `cash-shifts` module computes the expected cash of an open shift from the contract payment
ledger and the expense ledger through their exported repository tokens; nothing is copied. The
contract module gains an upload route for return photos over a private file store port
(in-memory in demo / test, local disk otherwise) and a signed-link service (HMAC over the
session secret, 300 s), plus the deposit-refund ledger entry (`DEPOSIT_REFUND`, a third payment
kind that is neither revenue nor a refund of revenue). The settlement checklist no longer asks
for the deposit refund up front; the refund is its own ledger row (BR-07, PD-17).

## Shared contracts

```text
app/packages/contracts/src/
├── damage-catalog.ts                       # damageItemInputSchema, damageItemUpdateSchema, damageItemSchema, damageItemListSchema
├── cash-shifts.ts                          # cashShiftOpenInputSchema, cashShiftCloseInputSchema, cashShiftStatusSchema, cashShiftSchema,
│                                           # cashShiftExpectationSchema, cashShiftCurrentSchema, cashShiftListSchema, expectedCash, cashVariance
├── payments.ts                             # paymentKindSchema + DEPOSIT_REFUND; manualPaymentKindSchema (input); depositRefundInputSchema
├── payment-balance.ts                      # netPaid / caps ignore DEPOSIT_REFUND; balance + depositRefundedVnd
├── finance.ts                              # paymentBalanceSchema + depositRefundedVnd
├── returns.ts                              # inspectionChargeInputSchema / contractChargeInputSchema + optional damageItemId; returnPhotoSchema,
│                                           # returnPhotoListSchema, returnPhotoUploadSchema, RETURN_PHOTO_LIMITS
├── contracts.ts                            # contractEventTypeSchema + DEPOSIT_REFUNDED; contractSettlementSchema + depositRefunded
└── index.ts                                # + cash-shifts, damage-catalog
```

## Backend — persistence

```text
app/apps/api/prisma/
├── schema.prisma                           # enum PaymentKind + DEPOSIT_REFUND; enum ContractEventType + DEPOSIT_REFUNDED; enum CashShiftStatus;
│                                           # model DamageItem (code unique, name, priceVnd, active); model CashShift (opener, float, status, close figures, note)
└── migrations/202609180002_operations_finance/migration.sql
```

## Backend — shared infrastructure

```text
app/apps/api/src/common/
├── errors/domain.error.ts                  # + CASH_SHIFT_*, CONTRACT_NOT_SETTLED, DAMAGE_ITEM_*, DEPOSIT_ALREADY_REFUNDED, NO_DEPOSIT_REFUND_DUE, TOO_MANY_FILES, UNSUPPORTED_FILE
├── filters/api-exception.filter.ts         # status map for the new codes
├── throttle/throttle.policy.ts             # + 'upload' policy (per ten minutes)
├── throttle/request-throttle.service.ts    # + RATE_LIMIT_UPLOAD_PER_TEN_MINUTES
├── files/file-store.tokens.ts              # PRIVATE_FILE_STORE
├── files/file-store.types.ts               # PrivateFileStore port (put / get), StoredFile
├── files/memory-file-store.ts              # demo / test store
├── files/disk-file-store.ts                # PRIVATE_FILE_DIR store (path-traversal safe)
├── files/image-signature.ts                # detectImageType (JPEG / PNG / WebP magic bytes)
├── files/signed-link.service.ts            # sign(objectKey) → { url, expiresInSeconds }; verify(token) → objectKey | null
├── files/private-file.controller.ts        # GET /api/private-files/:token (public, no-store, 404 on bad / expired)
└── files/file-store.module.ts              # global module: memory store when DEMO_MODE or NODE_ENV=test, disk store otherwise; SignedLinkService, controller
app/apps/api/src/config/environment.ts      # + PRIVATE_FILE_DIR, RATE_LIMIT_UPLOAD_PER_TEN_MINUTES
```

## Backend — damage catalog module

```text
app/apps/api/src/modules/damage-catalog/
├── damage-catalog.tokens.ts                # DAMAGE_CATALOG_REPOSITORY
├── damage-catalog.types.ts                 # DamageItemRecord, DamageCatalogRepository port
├── demo-damage-catalog.repository.ts       # in-memory, unique code → CONFLICT
├── prisma-damage-catalog.repository.ts     # Prisma adapter (P2002 → CONFLICT)
├── damage-catalog.service.ts               # list (Staff active only), create, update; audit DAMAGE_ITEM_CREATED / DAMAGE_ITEM_UPDATED
├── damage-catalog.controller.ts            # GET /api/catalog/damage-items, POST (Owner + CSRF), PATCH /:id (Owner + CSRF)
└── damage-catalog.module.ts                # global module exporting the repository
```

## Backend — cash shifts module

```text
app/apps/api/src/modules/cash-shifts/
├── cash-shift.tokens.ts                    # CASH_SHIFT_REPOSITORY
├── cash-shift.types.ts                     # CashShiftRecord, CashShiftRepository port (create, findById, findOpen, list, close)
├── demo-cash-shift.repository.ts
├── prisma-cash-shift.repository.ts
├── cash-shift.policy.ts                    # cashMovements(contracts, expenses, window), buildExpectation(shift, movements, asOf); canClose(shift, actor)
├── cash-expectation.service.ts             # reads the contract and economics ports; nothing about cash is stored twice (BR-10)
├── cash-shift.service.ts                   # open (409 already open), current (+ live expectation), close (note rule, 409 not open, 403 other opener), list by role; audit CASH_SHIFT_OPENED / CASH_SHIFT_CLOSED
├── cash-shift.controller.ts                # GET /api/cash-shifts, GET /current, POST (CSRF), POST /:id/close (CSRF)
└── cash-shift.module.ts
app/apps/api/src/modules/economics/economics.module.ts # exports ECONOMICS_REPOSITORY
app/apps/api/src/app.module.ts              # + DamageCatalogModule, FileStoreModule, CashShiftModule
```

## Backend — contract module changes

```text
app/apps/api/src/modules/contracts/
├── contract.types.ts                       # ChargeDraft.metadata; ContractRepository + markDepositRefunded, returnImageObjectKeys(id, lineId)
├── contract-charge.pricing.ts              # ChargePricingService.price(input) → amount / description / metadata (404 / 409 rules, free text)
├── contract-return.service.ts              # prices inspection charges through ChargePricingService
├── contract-settlement.service.ts          # prices manual charges the same way; checklist keeps the document gate only
├── contract-payment.policy.ts              # + depositRefundDue(contract); caps use ManualPaymentKind
├── contract-payment.service.ts             # + refundDeposit(id, input, actor): rules, DEPOSIT_REFUND row, event, audit, replay
├── contract-payment.controller.ts          # + POST /:id/deposit-refund (CSRF)
├── contract-photo.service.ts               # upload(contractId, files) → keys; links(id, lineId) → signed items
├── contract-photo.controller.ts            # POST /:id/return-photos (CSRF, upload throttle, FilesInterceptor 5 × 2 MB), GET /:id/lines/:lineId/return-photos
├── demo-contract.repository.ts             # markDepositRefunded, returnImageObjectKeys
├── prisma-contract.repository.ts           # same over Prisma (transaction: payment + event + settlement flag)
├── prisma-contract.queries.ts              # list where / create data helpers moved out of the repository to keep it under the length gate
├── prisma-payment.writes.ts                # DEPOSIT_REFUND row + DEPOSIT_REFUNDED event in one transaction
├── vehicle-sync.service.ts                 # unchanged behaviour; typed against the widened event union
└── contract.module.ts                      # + ChargePricingService, ContractPhotoService, ContractPhotoController
app/apps/api/src/modules/finance/revenue-report.policy.ts # DEPOSIT_REFUND rows excluded from the cash-based report
```

## Admin

```text
app/apps/admin/src/features/settings/
├── index.ts                                # + DamageItemsPage
├── api/damage-catalog-api.ts               # fetchDamageItems(includeInactive), createDamageItem, updateDamageItem
├── hooks/use-damage-catalog.ts             # useDamageCatalog(includeInactive), useCreateDamageItem, useUpdateDamageItem (invalidate 'damage-items')
├── hooks/use-damage-item-form.ts
├── hooks/use-damage-catalog-page.ts        # dialog state (create / edit), show-inactive toggle
├── lib/damage-catalog-presentation.ts      # initial form, toInput, blocked rule, status tone, sorted rows
├── lib/settings-translations.ts            # settings tab strip + damage catalog copy (en / vi)
├── pages/DamageItemsPage.tsx
├── pages/SettingsPage.tsx                  # + tabs
├── components/SettingsTabs.tsx             # "Bảng giá" | "Hạng mục hư hỏng" (nav, aria-current)
├── components/damage/DamageCatalogHeader.tsx
├── components/damage/DamageItemList.tsx    # table ≥ sm, cards < sm, empty state
├── components/damage/DamageItemTable.tsx
├── components/damage/DamageItemRow.tsx
├── components/damage/DamageItemCard.tsx
├── components/damage/DamageItemActions.tsx # edit + toggle
├── components/damage/DamageItemActionButton.tsx # aria-label "<action> <code>"
├── components/damage/DamageItemDialog.tsx
├── components/damage/DamageItemFields.tsx
└── components/damage/DamageItemCodeField.tsx # read-only while editing

app/apps/admin/src/features/cash-shifts/
├── index.ts                                # CashShiftPage
├── api/cash-shift-api.ts
├── hooks/use-cash-shifts.ts                # history, current (30 s refetch), open, close
├── hooks/use-cash-shift-page.ts
├── hooks/use-cash-shift-form.ts            # open and close forms with one submit path
├── lib/cash-shift-presentation.ts          # openBlocked, closeBlocked, previewVariance, movementRows, varianceTone, formatVariance
├── lib/cash-shift-translations.ts
├── pages/CashShiftPage.tsx
├── components/CashShiftHeader.tsx          # "Mở ca" hidden while a shift is open
├── components/CashShiftWorkspace.tsx
├── components/current/CurrentShiftCard.tsx
├── components/current/CurrentShiftEmpty.tsx
├── components/current/CurrentShiftDetails.tsx
├── components/current/CurrentShiftSummary.tsx
├── components/current/CurrentShiftFigure.tsx # "Tiền mặt phải có"
├── components/current/MovementChips.tsx
├── components/history/ShiftHistoryList.tsx # closed shifts only
├── components/history/ShiftHistoryTable.tsx
├── components/history/ShiftHistoryTableRow.tsx
├── components/history/ShiftHistoryCard.tsx
├── components/history/VarianceBadge.tsx    # Khớp / Thiếu / Thừa
├── components/dialogs/CashShiftDialogs.tsx
├── components/dialogs/OpenShiftDialog.tsx
├── components/dialogs/CloseShiftDialog.tsx
├── components/dialogs/CloseShiftFields.tsx
├── components/dialogs/CloseShiftExpectedLine.tsx
├── components/dialogs/CloseShiftAmountField.tsx
├── components/dialogs/CloseShiftVariancePreview.tsx
└── components/dialogs/CloseShiftNoteField.tsx

app/apps/admin/src/features/contracts/
├── api/contracts-api.ts                    # + uploadReturnPhotos, fetchReturnPhotos, refundDeposit
├── hooks/use-return-photos.ts              # signed links per line, staleTime 0
├── hooks/use-return-vehicle.ts             # upload photos first, then return with the keys
├── hooks/use-damage-items.ts               # active catalog for the selects
├── hooks/use-deposit-refund-form.ts
├── hooks/use-contract-mutations.ts         # + refundDeposit
├── hooks/use-contract-detail-page.ts       # + depositRefundDue
├── lib/return-form.ts                      # + photos, damageItemId; applyDamageItem; toReturnInput(form, keys); toReturnSubmission; photoIssue
├── lib/settlement-presentation.ts          # ChargeFormValues + damageItemId; applyChargeItem; catalogLocked; settleBlocked drops the deposit gate
├── lib/contract-presentation.ts            # + 'refundDeposit' action; depositRefundDue; DEPOSIT_REFUNDED describer
├── lib/payment-presentation.ts             # ManualPaymentKind forms; DEPOSIT_REFUND sign; deposit refund form → input; balance row "Đã hoàn cọc"
├── lib/contract-translations.ts            # + contractEvent.DEPOSIT_REFUNDED
├── lib/payment-translations.ts             # + depositRefund*, ledgerDepositRefunded, paymentKindOption.DEPOSIT_REFUND
├── lib/settlement-translations.ts          # − settleDepositRefunded; + damageItem*, returnPhoto*
├── components/returns/ReturnPhotoField.tsx
├── components/returns/DamageItemSelect.tsx # shared by the return and charge dialogs
├── components/returns/ReturnChargeFields.tsx / ReturnChargeAmountFields.tsx / ReturnVehicleDialog.tsx
├── components/detail/ReturnPhotoGallery.tsx
├── components/detail/ContractLineInspection.tsx / ContractLineReturn.tsx / ContractLineItem.tsx # lineId down to the gallery
├── components/detail/ContractActions.tsx / ContractDetailContent.tsx / TimelineEvent.tsx
├── components/settlement/ChargeFields.tsx / ChargeLineField.tsx / ChargeAmountFields.tsx / AddChargeDialog.tsx
├── components/settlement/SettleChecklistFields.tsx / SettleContractDialog.tsx
├── components/settlement/DepositRefundDialog.tsx / DepositRefundFields.tsx
├── components/settlement/DepositRefundBadge.tsx / SettlementStatus.tsx # "Chưa hoàn cọc" / "Đã hoàn cọc"
├── components/payments/PaymentKindField.tsx / LedgerEntryItem.tsx
└── components/lifecycle/LifecycleDialogs.tsx # 'refundDeposit' case

app/apps/admin/src/
├── App.tsx                                 # + /cash-shifts (both), /settings/damage-items (Owner)
├── shared/api/http.ts                      # + apiUpload (FormData, CSRF, no JSON content-type)
├── shared/navigation/routes.ts             # + Ca tiền mặt (Coins)
├── shared/i18n/i18n.ts                     # + cashShiftTranslations, settingsTranslations
└── features/audit/lib/*                    # + CASH_SHIFT_*, DAMAGE_ITEM_*, CONTRACT_DEPOSIT_REFUNDED, CONTRACT_REFUND_RECORDED; entities CashShift, DamageItem; meta keys
```

## Tests

```text
app/tests/domain/damage-catalog.test.ts             # validation outline, pricing rules (404 / 409 / free text)
app/tests/domain/cash-shift.test.ts                 # expected-cash outline, movement window, note rule
app/tests/domain/contract-payment.test.ts           # DEPOSIT_REFUND ignored by netPaid / caps / balance
app/tests/domain/revenue-report.test.ts             # DEPOSIT_REFUND rows excluded
app/tests/domain/signed-link.test.ts                # sign / verify / expiry / tamper, image signatures
app/tests/domain/hardening-policies.test.ts         # upload throttle policy
app/tests/api/damage-catalog.test.ts                # Owner CRUD, audits, 409, 403, Staff list
app/tests/api/return-photos.test.ts                 # upload, keys, imageCount, signed links, refusal outline
app/tests/api/deposit-refund.test.ts                # refund flow, replay, 409 rules
app/tests/api/cash-shifts.test.ts                   # open / expectation / close / note / 409 / role lists
app/tests/api/contract-settlement.test.ts           # checklist without the deposit gate
app/tests/api/contract-returns.test.ts / contract-payments.test.ts # catalog-priced return charge; manual kinds only
app/tests/infrastructure/prisma-sprint12.repositories.test.ts
app/tests/admin/cash-shift-presentation.test.ts
app/tests/admin/damage-catalog-presentation.test.ts
app/tests/admin/return-form.test.ts                 # catalog item into the forms, photos bundled, upload limits mirrored
app/tests/admin/settlement-presentation.test.ts     # deposit gate removed, refund action, catalog charge input
app/tests/admin/payment-presentation.test.ts        # DEPOSIT_REFUND sign, refund input, depositRefundedVnd row
app/tests/admin/navigation.test.tsx                 # + /cash-shifts for both roles
app/e2e/operations-finance.spec.ts                  # the two browser journeys
app/e2e/release-accessibility.spec.ts               # + /cash-shifts, /settings/damage-items
app/e2e/workspace-navigation.spec.ts                # + /settings/damage-items Owner-only
app/playwright.config.ts                            # RATE_LIMIT_UPLOAD_PER_TEN_MINUTES raised for parallel workers
```

## Rules carried into code

- A catalog-priced charge copies the item name and price at the time of the charge and keeps
  `damageItemId` / `damageItemCode` in the charge metadata; later price changes never touch
  existing contracts. Inactive items are refused (409), unknown ones 404, free text stays valid.
- Return photos: at most 5 files of 2 MB per request, JPEG / PNG / WebP by magic bytes, keys
  `private/returns/<contractId>/<uuid>.<ext>`; the API never echoes keys or file names. Links
  are HMAC-SHA256 tokens over `objectKey|exp` with the session secret, valid 300 s, served
  with `Cache-Control: private, no-store`. The admin uploads first and only then posts the
  return, so a refused upload leaves the line open and the dialog visible.
- `DEPOSIT_REFUND` is a payment row whose amount equals the frozen settlement refund; it is
  excluded from `paidVnd`, `refundedVnd`, every cap, the revenue report and receivables; it is
  written once (409 afterwards) and only after settlement; replay by key returns the same row.
  The admin offers "Hoàn cọc" only while `refundVnd > 0 && !depositRefunded` (PD-17).
- Expected cash = opening float + CASH payments − CASH refunds − CASH deposit refunds − CASH
  expenses (reversals add back) with `receivedAt` / `createdAt` in `[openedAt, now)`;
  variance = counted − expected; a non-zero variance requires a note; only one open shift at a
  time for the whole shop; Staff lists their own shifts, the Owner lists all.

## Drift from the draft

- The API module is `modules/damage-catalog/` (not `modules/catalog/`); `cash-expectation.service.ts`
  separates the port reads from the shift rules; `prisma-contract.queries.ts` and
  `prisma-payment.writes.ts` keep the Prisma repository under the length gate.
- The admin page is `DamageItemsPage` with `settings-translations.ts`; the settings strip is
  "Bảng giá" | "Hạng mục hư hỏng". The function-length gate produced the extra components
  listed above (`DamageItemActionButton`, `DamageItemCodeField`, the split cash-shift current /
  dialog components, `ChargeLineField`, `DepositRefundFields`, `DepositRefundBadge`).
- One `use-cash-shift-form.ts` serves both dialogs instead of a close-only hook.
