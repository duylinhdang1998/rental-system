# 09 — Return Queue, Per-Vehicle Return and Settlement

**Stories:** US-016 (per-vehicle return), US-017 (charges and settlement)  
**Rules:** BR-03 (a contract completes only when every vehicle is back), BR-04 (money direction
is explicit), BR-06 (discounts are Owner-only), BR-07 (a settled contract is frozen), PD-05
(60 free late minutes, then 20.000 VND per started hour from the line snapshot).  
**Scenarios:** `.project/scenarios/sprint-5/return-settlement.feature`

## Return queue — `/returns` (desktop)

```text
Trả xe                                   Cập nhật 10:05 · Asia/Ho_Chi_Minh
[Quá hạn 2 · trễ nhất 19 giờ] [Đến hạn hôm nay 1 · gần nhất 17:00] [Hợp đồng đang thuê 3 · 4 xe]

Quá hạn
┌──────────────────────────────────────────────────────────────────────────────┐
│ HD-2026-DEMO0001            Khách hàng mẫu                    [Trễ 19 giờ]   │
│ Đã nhận 0/2 xe · Cọc 500.000 ₫                                               │
│   XE-001  Hạn trả 05/10 15:00  [Trễ 19 giờ]                     [Nhận xe]    │
│   XE-002  Hạn trả 06/10 17:00  [Đến hạn hôm nay]                [Nhận xe]    │
└──────────────────────────────────────────────────────────────────────────────┘
Đến hạn hôm nay
┌──────────────────────────────────────────────────────────────────────────────┐
│ HD-2026-DEMO0003            Khách B                        [Đến hạn hôm nay] │
│ Đã nhận 1/2 xe · Cọc 0 ₫                                                     │
│   XE-003  Hạn trả 06/10 16:00                                   [Nhận xe]    │
└──────────────────────────────────────────────────────────────────────────────┘
Sắp tới
…
```

- Three KPI cards: overdue lines, lines due today, contracts renting (vehicles still out).
- Sections in work order: overdue (latest first), due today, later — the same order the API returns.
- Each card links to the contract detail; each open line has its own “Nhận xe” button.
- Empty state: “Không có xe nào đang ở ngoài”. Error state keeps the shell and offers retry.

## Return queue (mobile)

```text
Trả xe
[Quá hạn 2] [Hôm nay 1]
[Đang thuê 3]
┌──────────────────────────┐
│ HD-…DEMO0001  [Trễ 19 h] │
│ Khách hàng mẫu           │
│ Đã nhận 0/2 xe · Cọc …   │
│ XE-001 · 05/10 15:00     │
│               [Nhận xe]  │
│ XE-002 · 06/10 17:00     │
│               [Nhận xe]  │
└──────────────────────────┘
```

## Return dialog — “Nhận xe” (shared by queue and contract detail)

```text
┌ Nhận xe ────────────────────────────────────────────────┐
│ Ghi nhận giờ trả, tình trạng và mức xăng của XE-001.    │
│ Giờ trả thực tế   [2026-10-06 17:30]                    │
│ ┌ Phí trả trễ ──────────────────────────────────────┐   │
│ │ Lịch trả 06/10 15:00 · Trễ 150 phút · 2 giờ tính  │   │
│ │ phí · +40.000 ₫                                   │   │
│ └───────────────────────────────────────────────────┘   │
│ Tình trạng xe     [Tốt · sẵn sàng cho thuê ▾]           │
│ Mức xăng khi trả  [50] %                                │
│ Ghi chú           [__________________________]          │
│ ┌ Phụ phí phát hiện khi nhận xe (tuỳ chọn) ─────────┐   │
│ │ Loại [Hư hỏng ▾]  Số tiền (VNĐ) [______]          │   │
│ │ Nội dung [______________________________]         │   │
│ └───────────────────────────────────────────────────┘   │
│                            [Hủy]  [Xác nhận nhận xe]    │
└─────────────────────────────────────────────────────────┘
```

- The late-fee preview uses the shared formula from `@rental/contracts`, so the browser and the
  API always agree; “Trả đúng giờ · không phát sinh phí” when inside the grace period.
- Condition MAINTENANCE/DAMAGED parks the vehicle outside the rental flow (BR-02).
- One optional inspection charge (DAMAGE/OTHER) is written in the same transaction.
- Photos stay in the private object store; the UI only shows the count.

## Contract detail — line state and settlement panel

```text
Xe thuê
┌ XE-001  300.000 ₫                        ┐   ┌ XE-002  300.000 ₫                        ┐
│ 01/10 15:00 → 03/10 15:00                │   │ 01/10 15:00 → 03/10 15:00                │
│ [Đã nhận xe] 03/10 17:30 · Tốt · 50%     │   │                          [Nhận xe]       │
│ Phí trả trễ +40.000 ₫                    │   │                                          │
└──────────────────────────────────────────┘   └──────────────────────────────────────────┘

Tất toán                                              [Còn xe chưa trả: XE-002]
Bảng kê                              Tổng phí                 640.000 ₫
 XE-001 · 2 ngày × 150.000 ₫  300.000 ₫   Tổng phải thu            640.000 ₫
 XE-002 · 2 ngày × 150.000 ₫  300.000 ₫   Đã thanh toán                  0 ₫
 XE-001 · Trả trễ 150 phút     40.000 ₫   Tiền cọc                 500.000 ₫
                                          Cọc khấu trừ             500.000 ₫
                                          Khách còn phải trả       140.000 ₫
                                          Hoàn lại cho khách             0 ₫
Thanh toán được ghi ở Sprint 6; đến lúc đó “Đã thanh toán” luôn bằng 0.
```

- The panel appears for ACTIVE, OVERDUE and COMPLETED contracts.
- Status chip: open vehicles → “Còn xe chưa trả: …”; all returned → outcome badge
  “Cần thu thêm” / “Cần hoàn cọc” / “Đã cân bằng” with the amount; settled → “Đã tất toán” and
  the time.
- Receivable and refund are two separate rows; a single signed number is never shown (BR-04).
- Actions: ACTIVE/OVERDUE → Gia hạn, Đổi xe, Ghi phụ phí; COMPLETED → Tất toán hợp đồng, Ghi
  phụ phí; settled → “Hợp đồng đã đóng”.

## Charge dialog — “Ghi phụ phí”

```text
┌ Ghi phụ phí ────────────────────────────────────────────┐
│ Số tiền (VNĐ) [______]   Nội dung [___________________] │
│ Loại [Khác ▾]  (Giảm trừ chỉ hiện cho Chủ cửa hàng)     │
│ Áp dụng cho [Cả hợp đồng ▾ | XE-001 | XE-002]           │
│                                 [Hủy]  [Lưu phụ phí]    │
└─────────────────────────────────────────────────────────┘
```

## Settlement dialog — “Tất toán hợp đồng”

```text
┌ Tất toán hợp đồng ──────────────────────────────────────┐
│ Xác nhận số tiền và việc trả cọc, giấy tờ cho khách.    │
│ Tiền cọc khấu trừ (VNĐ) [340000]  Tối đa 340.000 ₫      │
│ [Cần hoàn cọc · 160.000 ₫]                              │
│ [ ] Đã trả giấy tờ giữ lại: CCCD ••••0000               │
│ [ ] Đã hoàn cọc cho khách                               │
│ Ghi chú [_____________________________________]         │
│                              [Hủy]  [Xác nhận tất toán] │
└─────────────────────────────────────────────────────────┘
```

- Deposit applied defaults to `min(deposit, outstanding)` and is capped there; the outcome
  badge recomputes locally while the value changes.
- The confirm button stays disabled until the retained document (when any) and the refund
  (when > 0) are confirmed; the API enforces the same checklist.
- After settlement the figures are frozen, the timeline shows “Tất toán” and no further charge
  or settlement is possible (BR-07).

## Timeline entries

- “Nhận xe · XE-001 · 03/10 17:30 · +40.000 ₫”
- “Ghi phụ phí · XE-001 · +100.000 ₫ · Trầy yếm trước” (discounts render with “−”)
- “Đã nhận đủ xe” (COMPLETED)
- “Tất toán · 640.000 ₫ · ghi chú”

## Accessibility and states

- Dialogs autofocus the first field, trap focus and return it on close; errors render in
  `role="alert"`.
- Inputs use native semantics from the shared UI kit only (no custom pickers).
- Money uses `formatCurrency` in the active locale; times are shown in Asia/Ho_Chi_Minh.
