# 03 — Operations Dashboard

**Story:** US-003  
**Purpose:** Let the shop scan today’s work in under 10 seconds.

## Desktop

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Tổng quan hôm nay                        31/08/2026      [+ Tạo hợp đồng]     │
│ Chào buổi sáng, Duy Linh.                                                    │
├─────────────────┬─────────────────┬─────────────────┬────────────────────────┤
│ Xe sẵn sàng     │ Đang cho thuê   │ Trả hôm nay     │ Quá hạn                │
│ 18              │ 12              │ 5               │ 2  [Xem ngay →]        │
│ +2 từ hôm qua   │ 3 sắp đến hạn   │ gần nhất 10:30  │ trễ nhất 6 giờ         │
├──────────────────────────────────────────┬───────────────────────────────────┤
│ CẦN XỬ LÝ TRƯỚC                          │ TÌNH TRẠNG ĐỘI XE                 │
│ [Quá hạn] HD-0268 · 43A1-123.45 · +6h   │ [donut/bar chart + text summary]  │
│ [Sắp trả] HD-0271 · 43A1-909.12 · 10:30 │ Sẵn sàng 18 · Thuê 12 · Khác 4   │
│ [Đặt trước] HD-0275 · nhận 13:00         │                                   │
│ [Xem tất cả công việc]                   │ [Xem danh sách xe]                │
├──────────────────────────────────────────┴───────────────────────────────────┤
│ LỊCH HÔM NAY                                           [Tất cả] [Trả] [Nhận]│
│ Giờ   Loại  Hợp đồng  Khách hàng      Xe          Trạng thái       Thao tác │
│ 10:30 Trả   HD-0271   Nguyễn Minh An  43A1...     Sắp đến hạn      [Xem]    │
│ 13:00 Nhận  HD-0275   Emma Wilson     43A1...     Đã xác nhận      [Xem]    │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Mobile

```text
┌──────────────────────────────┐
│ Tổng quan hôm nay            │
│ 31/08/2026                   │
│ [     + Tạo hợp đồng      ]  │
├──────────────┬───────────────┤
│ Sẵn sàng 18  │ Đang thuê 12  │
│ Trả hôm nay 5│ Quá hạn 2 ⚠   │
└──────────────┴───────────────┘
│ Cần xử lý trước              │
│ ┌──────────────────────────┐ │
│ │ [Quá hạn] HD-0268        │ │
│ │ 43A1-123.45 · trễ 6 giờ  │ │
│ │ [Xem hợp đồng]           │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ [Sắp trả] HD-0271 10:30  │ │
│ └──────────────────────────┘ │
│ Lịch hôm nay       [Lọc ▾]   │
│ [mobile schedule cards...]   │
└──────────────────────────────┘
```

## Priority and states

- Order: overdue → due soon → handover/reservation → general schedule.
- KPI values use tabular numerals; alert cards include explicit time difference.
- Chart always includes a text summary and is hidden before its data loads.
- Empty: congratulatory but concise “Không có việc gấp hôm nay” plus link to fleet.
- Error: keep last-known shell, show retry; never display a zero KPI as if data loaded.
- “Tạo hợp đồng” is disabled in Sprint 1 with tooltip/copy “Có trong Sprint 3”.
