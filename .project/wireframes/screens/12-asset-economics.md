# 12 — Vehicle Cost, Expenses and Fleet Economics

**Stories:** US-023 (vehicle acquisition and depreciation), US-024 (expense ledger),
US-025 (fleet economics and break-even)  
**Rules:** BR-04 (every figure has one direction), BR-07 / BR-09 (append-only, corrections are
reversal entries), BR-08 (economics aggregates are Owner-only).  
**Scenarios:** `.project/scenarios/sprint-11/asset-economics.feature`

## Acquisition dialog — vehicle list (`/vehicles`, Owner only)

```text
Biển số        Loại xe   Dòng xe   Trạng thái   Ngày tạo            Giá vốn
43A1-000.01    SCOOTER   Vision    Trống        02/08/2026 10:00    [Giá vốn]  Còn lại 24.000.000 ₫
XE-001
```

```text
┌ Giá vốn xe XE-001 ──────────────────────────────────────┐
│ Khấu hao đường thẳng theo tháng. Hợp đồng cũ không đổi. │
│ Giá mua (VNĐ)        [30000000]                          │
│ Ngày mua             [2026-01-15]                        │
│ Số tháng sử dụng     [36]         1–240                  │
│ Giá trị thanh lý     [3000000]    ≤ giá mua              │
│ ─────────────────────────────────────────────────────── │
│ Khấu hao/tháng 750.000 ₫ · Đã khấu hao 6.000.000 ₫       │
│ Giá trị còn lại 24.000.000 ₫ (tính đến hôm nay)          │
│                                  [Quay lại]  [Lưu giá vốn] │
└──────────────────────────────────────────────────────────┘
```

- The "Giá vốn" button and the book-value line render only for the Owner; Staff sees the list
  unchanged. The API refuses Staff with 403.
- The preview line uses the same `depreciationAt` function as the API, so the dialog and the
  report never disagree.
- Save is disabled while the salvage value exceeds the price or the useful life is outside
  1–240 months. A second save overwrites the record and the audit keeps before / after prices.
- Phone: the vehicle card gains the same button under its metadata.

## Expenses — `/expenses` (Staff and Owner)

```text
Chi phí                                                        [+ Ghi chi phí]
Mọi khoản chi đều là dòng bất biến; Chủ sửa sai bằng bút toán đảo.

[Tổng chi ròng 5.250.000 ₫ · 2 khoản] [Tiền mặt 250.000 ₫] [Chuyển khoản 5.000.000 ₫] [Đã đảo 0 ₫]

Từ [2026-09-01] Đến [2026-09-18] Loại [Tất cả ▾] Xe [Tất cả ▾]

Ngày        Loại          Diễn giải        Xe       Hình thức      Số tiền        Người ghi        
12/09/2026  Mặt bằng      Thuê tháng 9     —        Chuyển khoản   5.000.000 ₫    Chủ cửa hàng   [Đảo]
10/09/2026  Bảo dưỡng     Thay nhớt        XE-001   Tiền mặt         250.000 ₫    Nhân viên      [Đảo]
10/09/2026  Bảo dưỡng     Đảo: Nhập nhầm   XE-001   Tiền mặt       −250.000 ₫    Chủ cửa hàng   Bút toán đảo
```

- Newest paid day first; a reversal row shows the amount with a leading minus and the
  neutral badge "Bút toán đảo"; the reversed original shows the danger badge "Đã đảo" and
  loses its button.
- "Đảo" appears only for the Owner and only on originals that are not yet reversed; it opens
  a small dialog asking for the reason (3–240 characters).
- The category filter lists the eight categories; the vehicle filter lists the fleet.
- Empty state: "Chưa có khoản chi nào". Error keeps the shell and offers retry.
- Phone: one card per row with date, category badge, amount emphasised, vehicle code and
  recorder.

### Expense dialog — "Ghi chi phí"

```text
┌ Ghi chi phí ─────────────────────────────────────────────┐
│ Mỗi khoản chi là một dòng riêng, không sửa sau khi lưu.  │
│ Loại chi phí     [Bảo dưỡng ▾]                            │
│ Số tiền (VNĐ)    [250000]                                 │
│ Hình thức        [Tiền mặt ▾]                             │
│ Ngày chi         [2026-09-10]                             │
│ Xe               [XE-001 · 43A1-000.01 ▾]  (tuỳ chọn)     │
│ Diễn giải        [Thay nhớt                    ]          │
│ Mã tham chiếu    [            ]  (chuyển khoản)           │
│ Ghi chú          [______________________________]         │
│                                [Quay lại]  [Lưu khoản chi] │
└───────────────────────────────────────────────────────────┘
```

- Confirm is disabled while the amount is empty or zero or the description is shorter than
  3 characters. Each dialog instance owns one idempotency key.
- The paid day defaults to today in business time and cannot be in the future.

## Fleet economics — `/reports/fleet` (Owner only)

```text
[Doanh thu] [Đội xe]                                   Tính đến [2026-09-18]  [Xuất Excel]

Hiệu quả đội xe
[Giá vốn 30.000.000 ₫ · 3 xe] [Giá trị còn lại 24.000.000 ₫] [Doanh thu 560.000 ₫] [Chi phí 5.250.000 ₫]

Xe        Giá vốn         Còn lại         Doanh thu   Ngày thuê   Chi phí     Ròng        Thu hồi   Hòa vốn
XE-001    30.000.000 ₫    24.000.000 ₫    560.000 ₫   4           250.000 ₫   310.000 ₫   1%        Dự kiến 20 tháng (05/2028)
XE-002    —               —               150.000 ₫   1           0 ₫         150.000 ₫   —         Chưa có giá vốn
XE-003    —               —               0 ₫         0           0 ₫         0 ₫         —         Chưa có giá vốn
Chưa phân bổ              —               30.000 ₫    —           5.000.000 ₫ −4.970.000 ₫
Tổng      30.000.000 ₫    24.000.000 ₫    590.000 ₫   5           5.250.000 ₫ −4.660.000 ₫  1 / 3 xe hòa vốn
```

- Break-even badge tones: `Đã hòa vốn` success, `Dự kiến …` info, `Chưa dự báo được`
  warning (trailing 90-day net ≤ 0), `Chưa có giá vốn` neutral.
- "Chưa phân bổ" holds delivery fees and contract-level charges / discounts on the revenue
  side and expenses without a vehicle on the cost side.
- The "As of" field defaults to today; the report never looks into the future.
- The two tabs are links between `/reports` (revenue) and `/reports/fleet`; both pages share
  the tab strip so the Owner can switch without the sidebar.
- "Xuất Excel" is a same-origin GET link to `/api/reports/fleet-economics/export?asOf=…`;
  the sheet "Đội xe" repeats the table with numeric money cells and the same two extra rows.
- Staff opening `/reports/fleet` sees the access-denied screen; the API answers 403.

## Mobile — fleet economics

```text
[Doanh thu] [Đội xe]
Tính đến [2026-09-18]  [Xuất Excel]
[Giá vốn 30.000.000 ₫] [Còn lại 24.000.000 ₫]
[Doanh thu 560.000 ₫]  [Chi phí 5.250.000 ₫]
┌ XE-001 · Vision ──────── Dự kiến 20 tháng ┐
│ Doanh thu 560.000 · Chi 250.000           │
│ Ròng 310.000 · Thu hồi 1%                 │
│ Giá vốn 30.000.000 · Còn lại 24.000.000   │
└───────────────────────────────────────────┘
```
