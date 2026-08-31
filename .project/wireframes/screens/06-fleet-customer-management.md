# 06 — Fleet and Customer Management

**Stories:** US-007, US-008, US-009  
**Status:** DRAFT — awaiting Sprint 2 approval  
**Design:** Soft Modern Operations; reuse `AppShell`, `FilterBar`, `StatusBadge`, `ViewState`.

## Vehicle list — desktop

```text
Xe                                                     [ + Thêm xe ]
34 xe · 18 sẵn sàng
[Tìm biển số / mã / mẫu xe________________] [Trạng thái ▾] [Loại xe ▾] [Đặt lại]

┌─────────────┬──────────────────┬──────────────┬──────────────┬────────────────┐
│ Biển số     │ Xe               │ Loại         │ Trạng thái   │ Thao tác       │
├─────────────┼──────────────────┼──────────────┼──────────────┼────────────────┤
│ 43A1-000.01 │ TEST-001 · Đỏ    │ Scooter      │ ✓ Sẵn sàng  │ [Xem] [•••]    │
│ 43A1-000.02 │ TEST-002 · Trắng │ Scooter      │ ⚒ Bảo dưỡng │ [Xem] [•••]    │
└─────────────┴──────────────────┴──────────────┴──────────────┴────────────────┘
1–20 / 34                                                [Trước] 1 2 [Sau]
```

## Vehicle list — 360px

```text
╭──────────────────────────────╮
│ Xe                 [ + Thêm ]│
│ [Tìm biển số...____________] │
│ [Bộ lọc (2)]  [Sắp xếp ▾]    │
│                              │
│ ╭──────────────────────────╮ │
│ │ 43A1-000.01 [✓ Sẵn sàng]│ │
│ │ TEST-001 · Scooter · Đỏ  │ │
│ │ [Xem chi tiết]      [•••]│ │
│ ╰──────────────────────────╯ │
│ [Tải thêm]                   │
├──────────────────────────────┤
│ Tổng quan  Xe  Khách  HĐ  Trả│
╰──────────────────────────────╯
```

## Add/edit vehicle drawer

```text
┌────────────────────────────────────────┐
│ Thêm xe                           [×]  │
│ Mã xe *       [TEST-001____________]  │
│ Biển số *     [43A1-000.01_________]  │
│ Loại xe *     [Scooter____________▾]  │
│ Hãng / mẫu    [Honda] [Vision______]  │
│ Màu / năm     [Đỏ__] [2025_________]  │
│ Ảnh           [Tải ảnh riêng tư]      │
│                                        │
│ [Hủy]                       [Lưu xe]   │
└────────────────────────────────────────┘
```

- Duplicate plate error appears below the plate field and moves focus there.
- Status is not freely editable in this form; controlled transitions use a separate dialog.
- Maintenance transition requires reason and shows immutable history after save.

## Customer list — desktop

```text
Khách hàng                                         [ + Thêm khách hàng ]
[Tìm tên / điện thoại / email____________] [Nhãn ▾] [Cảnh báo ▾] [Đặt lại]

┌─────────────────┬──────────────────┬──────────────────┬──────────┬────────────┐
│ Khách hàng      │ Liên hệ chính    │ Nhãn             │ Lượt thuê│ Thao tác   │
├─────────────────┼──────────────────┼──────────────────┼──────────┼────────────┤
│ Test Customer   │ 0900•••001       │ VIP              │ 3        │ [Xem]      │
│ Risk Fixture    │ 0900•••002       │ ⚠ Blacklist     │ 1        │ [Xem]      │
│                 │                  │ Lý do hiển thị   │          │            │
└─────────────────┴──────────────────┴──────────────────┴──────────┴────────────┘
```

## Add/edit customer — responsive sections

```text
Thông tin cơ bản
Họ tên * [____________________]  Quốc tịch [Việt Nam ▾]

Kênh liên hệ
[Điện thoại] [0900000001________] [Chính ✓] [Xóa]
[ + Thêm điện thoại / email / khác ]

Nhãn khách hàng
[VIP] [Khách quen] [Blacklist]
Nếu Blacklist: Lý do * [________________________________]

Giấy tờ riêng tư
Loại [CCCD ▾]  Số [••••••••1234]  [Tải tệp riêng tư]
Tệp chỉ hiển thị qua quyền truy cập ngắn hạn; không xuất hiện trong danh sách.

[Hủy]                                                   [Lưu khách hàng]
```

## Duplicate and blacklist states

```text
POSSIBLE DUPLICATE
┌───────────────────────────────────────────────┐
│ Đã tìm thấy Test Customer · 0900•••001       │
│ Trùng số điện thoại sau chuẩn hóa.            │
│ [Mở hồ sơ hiện có] [Vẫn tạo hồ sơ mới]        │
└───────────────────────────────────────────────┘

BLACKLIST SELECTION
┌───────────────────────────────────────────────┐
│ ⚠ Khách hàng cần cảnh giác                    │
│ Lý do: Synthetic risk fixture                 │
│ ☐ Tôi đã đọc cảnh báo                         │
│ [Quay lại]                  [Tiếp tục chọn]   │
└───────────────────────────────────────────────┘
```

## States and accessibility

- Loading uses table/card skeletons without collapsing the app shell.
- Empty state distinguishes “no records” from “no filter matches” and offers the appropriate action.
- Error state keeps search/filter values and offers retry.
- Every status/warning uses icon + text; warning reason is announced with the customer name.
- Drawer becomes a full-screen sheet below 640px; all controls and actions are at least 44px.
- Search/filter state lives in the URL and survives locale/navigation changes.
