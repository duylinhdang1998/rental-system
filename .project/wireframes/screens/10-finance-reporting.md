# 10 — Payments, Receivables and Revenue Report

**Stories:** US-018 (payments and receivables), US-019 (reports and Excel export)  
**Rules:** BR-04 (money direction is explicit), BR-07 (financial records are immutable), BR-08
(Staff never sees revenue aggregates), FR-08 (cash / bank transfer / combined, several
transactions per contract), FR-09 (daily and period revenue, debt and employee reports, Excel
export in the approved 14-column layout).  
**Scenarios:** `.project/scenarios/sprint-6/finance-reporting.feature`

## Ledger panel — contract detail (`/contracts/:id`)

```text
┌ Thanh toán ────────────────────────────────────────────── [Còn phải thu 50.000 ₫] ┐
│ Đã thu 250.000 ₫      Tiền mặt 100.000 ₫   Chuyển khoản 150.000 ₫   Hoàn 0 ₫       │
│ Còn phải thu 50.000 ₫ (tổng phải trả 300.000 ₫)                                   │
│ ───────────────────────────────────────────────────────────────────────────────── │
│ 10/09 09:15  Tiền mặt        +100.000 ₫   Nhân viên                               │
│ 10/09 09:20  Chuyển khoản    +150.000 ₫   Nhân viên · FT26091012                  │
└────────────────────────────────────────────────────────────────────────────────── ┘
Actions: [Bàn giao xe] [Gia hạn] [Thu tiền] …   (Thu tiền stays after settlement while a
receivable remains; it disappears at 0 and for cancelled contracts)
```

- Badge tones: `Còn phải thu` danger, `Đã thu đủ` success, `Hoàn lại` info.
- Entries are append-only: no edit or delete affordance exists (BR-07).
- Staff and Owner see the same panel; refunds are recorded through the same dialog.

## Payment dialog — “Thu tiền”

```text
┌ Thu tiền ───────────────────────────────────────────────┐
│ Ghi nhận tiền khách trả. Mỗi lần thu là một giao dịch   │
│ riêng, không thể sửa sau khi lưu.                       │
│ Loại giao dịch   [Thu tiền ▾]                           │
│ Số tiền (VNĐ)    [100000]     Tối đa 300.000 ₫          │
│ Hình thức        [Tiền mặt ▾]                           │
│ Mã tham chiếu    [FT26091012]  (chuyển khoản)           │
│ Ghi chú          [______________________________]       │
│                              [Quay lại]  [Xác nhận thu] │
└─────────────────────────────────────────────────────────┘
```

- The cap line uses the same formula as the API: remaining receivable for payments, net paid
  for refunds. Confirm is disabled while the amount is empty, zero or above the cap.
- Each dialog instance owns one idempotency key, so a retry after a network error cannot
  double-collect.
- Mobile: fields stack and the amount field autofocuses.

## Receivables — `/receivables` (Staff and Owner)

```text
Công nợ                                   Cập nhật 10:05 · Asia/Ho_Chi_Minh
[Còn phải thu 250.000 ₫ · 2 hợp đồng] [Quá 7 ngày 1] [Thu gần nhất 10/09 09:20]

Hợp đồng        Khách hàng        Kết thúc     Còn phải thu   Số ngày   Thu gần nhất
HD-2026-…0003   Khách B           07/09 15:00  50.000 ₫       3 ngày    —           [Thu tiền]
HD-2026-…0004   Khách hàng mẫu    09/09 17:00  200.000 ₫      1 ngày    09/09 17:40 [Thu tiền]
```

- Oldest debt first; “Thu tiền” links to the contract detail where the dialog lives.
- Empty state: “Không còn công nợ”. Error keeps the shell and offers retry.
- Mobile: one card per contract with the remaining amount emphasised.

## Revenue report — `/reports` (Owner only)

```text
Báo cáo doanh thu                                      Từ [2026-09-01] Đến [2026-09-10] [Xuất Excel]
[Doanh thu ròng 400.000 ₫] [Tiền mặt 100.000 ₫] [Chuyển khoản 350.000 ₫] [Công nợ 250.000 ₫ · 2 HĐ]

Theo ngày
Ngày         Tiền mặt     Chuyển khoản   Hoàn       Ròng        Giao dịch   ▇▇▇▇▇▇▇▇▇▇
10/09/2026   100.000 ₫    350.000 ₫      50.000 ₫   400.000 ₫   4           ██████████

Theo nhân viên
Nhân viên       Tiền mặt     Chuyển khoản   Hoàn      Ròng        Giao dịch
Nhân viên       100.000 ₫    150.000 ₫      0 ₫       250.000 ₫   2
Chủ cửa hàng    0 ₫          200.000 ₫      50.000 ₫  150.000 ₫   2

Công nợ theo tuổi nợ
Trong hạn 1 · 100.000 ₫   1–7 ngày 1 · 150.000 ₫   8–30 ngày 0   Trên 30 ngày 0

Chi tiết hợp đồng (bố cục 14 cột của mẫu khách hàng)
STT  Khách hàng  Liên hệ  Thời gian  Ngày trả  Xe  Số ngày  Đơn giá  CK  TM  Cọc/Giấy tờ  Địa chỉ  NV  Ghi chú
```

- Default range is month-to-date in business time; the range never exceeds 92 days.
- The daily bars are a native `<progress>` fallback for the chart; every number is also a table
  cell so screen readers and Excel agree.
- “Xuất Excel” is a same-origin GET link to `/api/reports/revenue/export?from&to`; the sheet
  “Doanh thu” uses the 14-column header of the client sample and a totals row.
- Staff opening `/reports` directly gets the access-denied screen; the API answers 403.

## Mobile — report

```text
Báo cáo doanh thu
Từ [2026-09-01]  Đến [2026-09-10]
[Xuất Excel]
[Ròng 400.000 ₫] [Tiền mặt 100.000 ₫]
[CK 350.000 ₫]   [Công nợ 250.000 ₫]
┌ 10/09/2026 ─────────────────┐
│ TM 100.000 · CK 350.000     │
│ Hoàn 50.000 · Ròng 400.000  │
│ ██████████                  │
└─────────────────────────────┘
```
