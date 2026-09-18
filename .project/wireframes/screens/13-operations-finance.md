# 13 — Damage Catalog, Return Photos, Deposit Refund and Cash Shift

**Stories:** US-026 (damage catalog and price list), US-027 (cash shift close),
US-028 (return photos and deposit refund)  
**Rules:** BR-04 (every figure has one direction), BR-06 (Staff never discounts), BR-07 / BR-09
(append-only ledgers), BR-08 (Owner reviews every shift; Staff sees their own).  
**Scenarios:** `.project/scenarios/sprint-12/operations-finance.feature`

## Settings tab strip (`/settings`, `/settings/damage-items`, Owner only)

```text
Cài đặt
[Phí trả xe trễ] [Bảng giá hư hỏng]
```

- Both settings pages share the strip; the active tab carries `aria-current="page"`.
- Staff opening either route sees the access-denied screen; the API answers 403 on writes.

## Damage catalog — `/settings/damage-items` (Owner only)

```text
Bảng giá hư hỏng                                              [+ Thêm hạng mục]
Nhân viên chọn hạng mục khi nhận xe; giá được chép vào phụ phí tại thời điểm chọn.

Mã       Hạng mục            Giá đền bù     Trạng thái     Cập nhật
GUONG    Gương chiếu hậu     150.000 ₫      Đang dùng      18/09/2026 10:00   [Sửa] [Ngừng dùng]
YEM      Yếm trước           300.000 ₫      Ngừng dùng     18/09/2026 09:00   [Sửa] [Dùng lại]
```

- Sorted by code. An inactive row uses the neutral badge "Ngừng dùng"; an active row uses the
  success badge "Đang dùng". Toggling is one click and writes `DAMAGE_ITEM_UPDATED`.
- "Thêm hạng mục" opens a dialog with code (2–24, upper-cased on save), name (2–120) and price
  (0–1.000.000.000). A duplicate code shows "Mã hạng mục đã tồn tại" inline (409).
- "Sửa" opens the same dialog with the code read-only; name and price can change.
- Empty state: "Chưa có hạng mục hư hỏng". Phone: one card per item with the two buttons.

```text
┌ Thêm hạng mục hư hỏng ──────────────────────────────────┐
│ Mã            [GUONG      ]  2–24 ký tự, viết hoa        │
│ Tên hạng mục  [Gương chiếu hậu                ]          │
│ Giá đền bù    [150000     ]  VNĐ                         │
│                                   [Quay lại]  [Lưu hạng mục] │
└──────────────────────────────────────────────────────────┘
```

## Return dialog — damage item and photos (both roles)

```text
┌ Nhận xe XE-001 ─────────────────────────────────────────┐
│ Thời điểm nhận  [2026-09-18T10:30]   Xăng còn (%) [50]   │
│ Tình trạng      [Hư hỏng ▾]                              │
│ Ảnh nhận xe (tối đa 5)  [Chọn tệp…]  2 tệp đã chọn       │
│ Ghi chú         [______________________________]         │
│ Phụ phí         [Hư hỏng ▾]                              │
│ Hạng mục hư hỏng [Gương chiếu hậu · 150.000 ₫ ▾]         │
│ Số tiền (VNĐ)   [150000]   Nội dung [Gương chiếu hậu]    │
│                                   [Quay lại]  [Xác nhận nhận xe] │
└──────────────────────────────────────────────────────────┘
```

- The "Hạng mục hư hỏng" select renders only when the charge kind is "Hư hỏng"; its first
  option is "Tự nhập" (free text). Picking a catalog item fills amount and description and
  makes them read-only; "Tự nhập" unlocks them again.
- Photos: JPEG, PNG or WebP, at most 5 files of 2 MB. Files upload first (one request), then the
  return is posted with the returned keys. A refused upload keeps the dialog open with the
  API message; nothing is returned.
- The add-charge dialog on the contract detail gains the same "Hạng mục hư hỏng" select.

### Contract detail — inspection with photos

```text
XE-001 · Đã nhận 18/09/2026 10:30 · Hư hỏng · Xăng 50 % · Ảnh nhận xe: 2
[thumb 1] [thumb 2]
```

- Thumbnails come from `GET …/return-photos` (signed links, 300 s). A link that expired
  shows a broken-image placeholder with alt "Ảnh nhận xe"; reloading the page re-signs.

## Settlement — deposit refund (both roles)

```text
Tất toán · Đã tất toán 18/09/2026 11:00 · Hoàn khách 200.000 ₫ · Chưa hoàn cọc     [Hoàn cọc]
```

```text
┌ Hoàn cọc ───────────────────────────────────────────────┐
│ Hoàn 200.000 ₫ tiền cọc cho khách theo tất toán.        │
│ Hình thức   [Tiền mặt ▾]                                │
│ Mã tham chiếu [          ]  (chuyển khoản)               │
│ Ghi chú     [______________________________]             │
│                                   [Quay lại]  [Xác nhận hoàn cọc] │
└──────────────────────────────────────────────────────────┘
```

- "Hoàn cọc" appears only when the contract is settled, the refund figure is positive and the
  deposit is not yet refunded. The amount is fixed by the settlement; the dialog never asks
  for it. Each dialog instance owns one idempotency key.
- After confirming, the ledger lists "Hoàn cọc −200.000 ₫" (caution tone) and the settlement
  badge reads "Đã hoàn cọc". The balance card gains "Đã hoàn cọc 200.000 ₫" and keeps
  "Đã thu" unchanged (deposit money is not revenue).
- The settle dialog no longer asks "Đã hoàn cọc cho khách"; the document checklist stays.

## Cash shifts — `/cash-shifts` (Staff and Owner)

```text
Ca tiền mặt                                                          [Mở ca]
Mỗi ca ghi tiền đầu ca, tiền mặt phải có và tiền đếm được khi đóng.

┌ Ca hiện tại ─────────────────────────────────────────────── Đang mở ┐
│ Mở lúc 18/09/2026 08:00 · Nhân viên · Tiền đầu ca 1.000.000 ₫          │
│ [Thu tiền mặt 300.000 ₫] [Hoàn tiền mặt 50.000 ₫] [Hoàn cọc 200.000 ₫] [Chi tiền mặt 100.000 ₫] │
│ Tiền mặt phải có 950.000 ₫ (tính đến 10:32)                 [Đóng ca] │
└──────────────────────────────────────────────────────────────────────┘

Lịch sử
Mở lúc              Người mở      Đầu ca         Phải có        Đếm được       Chênh lệch     Ghi chú
17/09/2026 08:00    Nhân viên     1.000.000 ₫    950.000 ₫      930.000 ₫      −20.000 ₫      Thiếu tiền lẻ
16/09/2026 08:00    Chủ cửa hàng  500.000 ₫      700.000 ₫      700.000 ₫      0 ₫
```

- Without an open shift the card reads "Chưa mở ca" and the header button "Mở ca" opens a
  dialog with the opening float (0–1.000.000.000). "Đóng ca" opens a dialog that repeats the
  expected amount, asks for the counted amount and a note; the variance previews live and the
  note becomes required when the variance is not zero ("Ghi chú bắt buộc khi có chênh lệch").
- The expectation refreshes every 30 s while the page is open and after every close.
- Variance badge tones: `0 ₫` success, negative danger, positive warning. Money uses the
  locale formatter; a negative variance renders with a true minus sign.
- Staff sees only their own shifts; the Owner sees everyone's with the opener column. Only the
  opener or the Owner may close a shift (403 otherwise).
- Phone: the current-shift card stacks the four KPI chips two per row; history rows become
  cards with opener, expected / counted and the variance badge.

```text
┌ Mở ca ───────────────────────────────┐   ┌ Đóng ca ────────────────────────────────────┐
│ Tiền đầu ca (VNĐ) [1000000]          │   │ Tiền mặt phải có 950.000 ₫                    │
│           [Quay lại]  [Mở ca]        │   │ Tiền đếm được (VNĐ) [930000]                  │
└──────────────────────────────────────┘   │ Chênh lệch −20.000 ₫                           │
                                           │ Ghi chú [Thiếu tiền lẻ            ] bắt buộc   │
                                           │                     [Quay lại]  [Xác nhận đóng ca] │
                                           └────────────────────────────────────────────────┘
```

## Navigation

- "Ca tiền mặt" (Coins icon) after "Chi phí" for both roles; "Cài đặt" keeps one entry and
  the tab strip switches between late-fee settings and the damage catalog.
