# 14 — Advanced Reporting: Analytics and Profit and Loss

**Stories:** US-029 (multi-dimensional revenue, utilisation, profit and loss),
US-030 (twelve-month trend charts)  
**Rules:** BR-04 (every figure has one direction), BR-08 (aggregates are Owner-only), BR-07 /
BR-09 (reports read the append-only ledgers; nothing is stored twice).  
**Scenarios:** `.project/scenarios/sprint-13/advanced-reporting.feature`

## Report tab strip (`/reports`, `/reports/fleet`, `/reports/analytics`, `/reports/pnl`)

```text
[Doanh thu] [Đội xe] [Phân tích] [Lãi lỗ]
```

- Four plain links styled as tabs; the active one carries `aria-current="page"`. Every tab is an
  Owner-only route; Staff sees the access-denied screen and the API answers 403.

## Analytics — `/reports/analytics` (Owner only)

```text
BÁO CÁO · Tạo lúc 10:05
Phân tích doanh thu
Doanh thu theo loại xe, xe, quốc tịch khách và tháng; phụ phí; tỷ lệ sử dụng xe. Chỉ Chủ cửa hàng xem được.

Từ ngày [2025-10-01]   Đến ngày [2026-09-18]                                   [Xuất Excel]

[Doanh thu 12.480.000 ₫ · 41 hợp đồng] [Ngày thuê 96] [Phụ phí ròng 380.000 ₫] [Chưa phân bổ 130.000 ₫]

Doanh thu theo tháng
┌ SVG (role="img", aria-label "Doanh thu theo tháng, 12 tháng") ─────────────────────┐
│  ▁▂▃▅▆▇█▇▆▅▃▂   one line, points labelled by month, y axis with 4 ticks            │
└────────────────────────────────────────────────────────────────────────────────────┘
Tháng      Doanh thu       Ngày thuê   Hợp đồng
10/2025    1.020.000 ₫     8           3
…
09/2026    570.000 ₫       4           1

Theo loại xe                             Theo xe
Loại xe     Doanh thu     Ngày  HĐ  Tỷ lệ  Xe        Doanh thu     Ngày  HĐ  Tỷ lệ
Xe tay ga   12.350.000 ₫  96    41  98 %   XE-001    5.100.000 ₫   40    17  40 %
Chưa phân bổ   130.000 ₫  —     —    1 %   XE-002    4.250.000 ₫   32    14  34 %
                                           XE-003    3.000.000 ₫   24    10  24 %
                                           Chưa phân bổ 130.000 ₫  —     —    1 %

Theo quốc tịch khách                     Phụ phí
Quốc tịch   Doanh thu     Ngày  HĐ  Tỷ lệ  Loại         Số lần   Số tiền
VN          9.480.000 ₫   70    31  75 %   Trả trễ      6        240.000 ₫
KR          3.000.000 ₫   26    10  24 %   Hư hỏng      2        330.000 ₫
                                           Khác         1         30.000 ₫
                                           Giảm giá     3        220.000 ₫   (trừ)
                                           Ròng                  380.000 ₫

Tỷ lệ sử dụng xe (ngày thuê / ngày có xe)
Xe / Loại     Ngày thuê   Ngày có xe   Tỷ lệ
XE-001        40          353          11 %  ▓▓░░░░░░░░
XE-002        32          353           9 %  ▓░░░░░░░░░
XE-003        24          353           6 %  ▓░░░░░░░░░
Xe tay ga     96          1059          9 %
Toàn đội      96          1059          9 %
```

- The range form reuses the revenue-report form with a 366-day limit; the message "Báo cáo tối
  đa 366 ngày" appears and the export button is disabled before any request is sent. The default
  range is the first day of the month eleven months ago up to today.
- Every dimension table sums to the same total revenue; contract-level charges, discounts and
  delivery fees appear as the "Chưa phân bổ" row in the type and vehicle tables and are attributed
  to the customer's nationality and to the month in the other two.
- Share bars are decorative (`aria-hidden`); the percentage is the text. Rows carry
  `data-dimension-row="<key>"` for tests.
- The monthly chart is inline SVG drawn from pure geometry (no chart library); the table below it
  is the fallback and the only place a screen reader needs.
- Empty window: "Không có doanh thu trong khoảng này" replaces the tables; the KPI cards show
  zero.
- Phone: KPI cards stack; the tables scroll horizontally inside their card; the SVG scales with
  `viewBox` and `width="100%"`.

## Profit and loss — `/reports/pnl` (Owner only)

```text
BÁO CÁO · Tạo lúc 10:05
Lãi lỗ theo tháng
Doanh thu trừ chi phí trừ khấu hao, từng tháng. Chỉ Chủ cửa hàng xem được.

Đến tháng [2026-09]   Số tháng [12 ▾]                                          [Xuất Excel]

[Doanh thu 12.480.000 ₫] [Chi phí 7.250.000 ₫] [Khấu hao 6.000.000 ₫] [Lãi lỗ −770.000 ₫]

Xu hướng 12 tháng
┌ SVG (role="img", aria-label "Xu hướng 12 tháng: doanh thu, chi phí, lãi lỗ") ──────┐
│  ── Doanh thu   ── Chi phí   ── Lãi lỗ      three lines, zero line drawn when needed │
└────────────────────────────────────────────────────────────────────────────────────┘
Legend: ● Doanh thu  ● Chi phí  ● Lãi lỗ   (text, outside the SVG)

Tháng     Doanh thu      Chi phí        Khấu hao     Lãi lỗ
10/2025   1.020.000 ₫    0 ₫            0 ₫          1.020.000 ₫
…
08/2026   300.000 ₫      5.000.000 ₫    750.000 ₫    −5.450.000 ₫
09/2026   570.000 ₫      250.000 ₫      750.000 ₫    −430.000 ₫
Tổng      12.480.000 ₫   7.250.000 ₫    6.000.000 ₫  −770.000 ₫
```

- "Đến tháng" is a month input (`YYYY-MM`); "Số tháng" offers 6, 12 and 24. The default is the
  current business month and 12 months.
- Revenue accrues by the business day of each line start, charge or activation (same rule as the
  fleet economics report); expenses count by paid day with reversals subtracting; depreciation is
  the straight-line monthly figure of every priced vehicle for the months elapsed since purchase.
- A negative figure renders with a true minus sign (U+2212). Rows carry `data-pnl-row="<month>"`.
- Phone: KPI cards stack in two columns; the table becomes a card list with month, profit
  emphasised and the three components underneath.

## Excel exports

- Analytics: `phan-tich-<from>-<to>.xlsx` with the sheets "Loại xe", "Xe", "Quốc tịch", "Tháng",
  "Phụ phí", "Sử dụng xe"; money stays numeric.
- Profit and loss: `lai-lo-<from>-<to>.xlsx` with the sheet "Lãi lỗ" and a total row.
- Both downloads are plain links (session cookie) under the export throttle policy.
