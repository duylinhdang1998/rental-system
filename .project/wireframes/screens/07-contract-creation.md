# 07 — Multi-vehicle Contract Creation

**Stories:** US-007, US-010, US-011, US-012, US-013  
**Status:** DRAFT — awaiting Sprint 3 approval  
**Pattern:** One route, five persisted steps; confirmation performs the atomic transaction.

## Desktop shell

```text
Tạo hợp đồng
Khách hàng ━━━ Xe ━━━ Giá thuê ━━━ Bàn giao ━━━ Xác nhận

┌──────────────────────────────────────────┬─────────────────────────────┐
│ Step content                             │ Tóm tắt hợp đồng            │
│                                          │ Khách: Test Customer        │
│                                          │ 2 xe · 01/09 → 06/09        │
│                                          │ Tiền xe       1.300.000 ₫   │
│                                          │ Phí giao         50.000 ₫   │
│                                          │ Tổng          1.350.000 ₫   │
│                                          │ [Giải thích giá]             │
└──────────────────────────────────────────┴─────────────────────────────┘
[Quay lại]                                                   [Tiếp tục]
```

## Step 1 — Customer

```text
[Tìm tên / điện thoại / email________________________]
┌─────────────────────────────────────────────────────┐
│ Test Customer · 0900•••001 · [VIP]        [Chọn]   │
│ ⚠ Risk Fixture · [Blacklist] · reason      [Chọn]   │
└─────────────────────────────────────────────────────┘
[ + Tạo khách hàng nhanh ]
```

- Blacklist customer opens the explicit acknowledgement dialog from screen 06.
- Quick create reuses the customer form and returns to the wizard without losing dates.

## Step 2 — Vehicles and interval

```text
Nhận xe * [01/09/2026 08:00]   Trả xe * [06/09/2026 08:00]
[Tìm biển số / loại xe________________] [Chỉ xe khả dụng ✓]

☑ TEST-001 · 43A1-000.01 · Scooter · ✓ Khả dụng
☑ TEST-002 · 43A1-000.02 · Scooter · ✓ Khả dụng
☐ TEST-003 · 43A1-000.03 · ⛔ Bận 03/09 08:00–04/09 08:00
```

- Availability uses `[start, end)`; an interval starting exactly at the old end is allowed.
- At least one vehicle is required. Conflict includes vehicle, interval and a non-color icon.

## Step 3 — Pricing

```text
TEST-001 · 5 ngày × 130.000 ₫                  650.000 ₫
  Bậc 3–6 ngày · Bảng giá v2
  VIP −10%                                     −65.000 ₫
  Thành tiền                                   585.000 ₫
  [Sửa giá] → Giá mới [________]  Lý do * [________________]

TEST-002 · 5 ngày × 130.000 ₫                  650.000 ₫
Phí giao xe [50.000]
```

- VND remains integer-only. Each line exposes tier, version, adjustment and override audit reason.
- Changing customer, interval or vehicles invalidates and recalculates the quote.

## Step 4 — Handover

```text
Tiền cọc [1.000.000]  Giấy tờ giữ [CCCD ▾]  Số [••••1234]
Địa điểm giao [Cửa hàng____________________________]

TEST-001  Mức xăng [75%]  [Tải ảnh riêng tư] [Tải ảnh riêng tư]
TEST-002  Mức xăng [60%]  [Tải ảnh riêng tư]
Ghi chú [________________________________________________________]
```

- Fuel range is 0–100. File controls accept image types/sizes from the private-file policy.
- The UI shows upload progress and retry but never displays raw object keys.

## Step 5 — Confirmation

```text
Khách hàng       Test Customer
Thời gian        01/09/2026 08:00 → 06/09/2026 08:00
Xe               TEST-001, TEST-002
Giá snapshot     v2 · 1.235.000 ₫ + 50.000 ₫
Cọc / giấy tờ    1.000.000 ₫ · CCCD ••••1234

☐ Tôi xác nhận thông tin bàn giao và giá đã hiển thị
[Quay lại chỉnh sửa]                          [Tạo hợp đồng]
```

After success:

```text
✓ Đã tạo hợp đồng HD-2026-000001
[Xem hợp đồng] [Xuất PDF Việt–Anh] [Về danh sách]
```

## Mobile 360px

```text
╭──────────────────────────────╮
│ Tạo hợp đồng        Bước 2/5 │
│ Xe                           │
│ [01/09 08:00] [06/09 08:00] │
│ [Tìm xe..._________________] │
│ ╭──────────────────────────╮ │
│ │ ☑ TEST-001              │ │
│ │ 43A1-000.01 · Scooter   │ │
│ │ ✓ Khả dụng              │ │
│ ╰──────────────────────────╯ │
│                              │
│ Tạm tính: 585.000 ₫          │
│ [Quay lại]       [Tiếp tục]  │
╰──────────────────────────────╯
```

## Conflict and error recovery

```text
┌─────────────────────────────────────────────────────┐
│ ⛔ TEST-002 vừa được giữ bởi hợp đồng khác          │
│ Trùng: 03/09/2026 08:00–04/09/2026 08:00           │
│ Dữ liệu khách hàng, giá và bàn giao vẫn được giữ.   │
│ [Chọn xe khác]                         [Thử lại]     │
└─────────────────────────────────────────────────────┘
```

- Validation summary moves focus to the first invalid field.
- Network errors never claim success; confirmation stays idempotent using a client request key.
- Mobile footer remains reachable without covering inputs; one primary action per step.
- VI/EN switches interface/date/currency formatting without translating names, plates or notes.
