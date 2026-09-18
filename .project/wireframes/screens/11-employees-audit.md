# 11 — Employees and Audit Log (Owner)

**Stories:** US-006 (Owner creates, locks and resets employee accounts), US-020 (audit log,
backup and go-live readiness)  
**Rules:** BR-08 (Owner-only administration), server-side authorization, immutable audit
history; a locked employee keeps every historical record under their name.  
**Scenarios:** `.project/scenarios/sprint-7/employee-management.feature`,
`.project/scenarios/sprint-7/release-hardening.feature`

## Employees (`/employees`, Owner only)

```text
┌ Nhân viên ─────────────────────────────────────────────── [+ Thêm nhân viên] ┐
│ Tài khoản đăng nhập của Chủ và Nhân viên. Khóa để chấm dứt phiên ngay.       │
│ ───────────────────────────────────────────────────────────────────────────  │
│ Họ và tên            Tên đăng nhập   Vai trò     Trạng thái   Thao tác        │
│ Chủ cửa hàng (Bạn)   owner           Chủ         Đang làm     [Đặt lại MK]    │
│ Nhân viên            staff           Nhân viên   Đang làm     [Khóa] [Đặt lại]│
│ Nguyễn Thị Lan       nv.lan          Nhân viên   Đã khóa      [Mở khóa] […]   │
└──────────────────────────────────────────────────────────────────────────────┘
Phone (≤ 640 px): one card per account with the same badge and the same two buttons.
```

- The Owner row shows "(Bạn)" and its lock button is disabled; the API refuses self-lock (409).
- `Đang làm` = success badge, `Đã khóa` = neutral badge. Lock and unlock have accessible names
  `Khóa <username>` / `Mở khóa <username>`.
- Locking revokes every session of the account immediately; the next request answers 401 and
  the login page shows "Tài khoản hiện không thể truy cập".

### Create dialog — "Thêm nhân viên"

```text
┌ Thêm nhân viên ─────────────────────────────────────────┐
│ Họ và tên        [Nguyễn Thị Lan            ]           │
│ Tên đăng nhập    [nv.lan                    ]           │
│   3–80 ký tự: chữ thường, số, dấu chấm, gạch            │
│ Mật khẩu         [••••••••••••              ]           │
│   Ít nhất 10 ký tự                                       │
│                              [Hủy]  [Tạo tài khoản]      │
└─────────────────────────────────────────────────────────┘
```

- Validation mirrors `@rental/contracts` (`usernameSchema`, `passwordSchema`); issues appear
  under the touched field, the confirm button stays disabled while any issue remains.
- A duplicate username returns 409 "Tên đăng nhập đã tồn tại" and is shown inline.

### Reset dialog — "Đặt lại mật khẩu"

One password field; on confirm the old password stops working and every session of that
account ends. The password is never written to the audit log.

## Audit log (`/audit`, Owner only)

```text
┌ Nhật ký ─────────────────────────────────────────────────────────────────────┐
│ 12 thay đổi gần nhất                                                          │
│ [Loại bản ghi ▾] [Thao tác ▾] [Từ ngày] [Đến ngày]           [Xóa bộ lọc]     │
│ ───────────────────────────────────────────────────────────────────────────  │
│ Sửa giá thuê                                              [Báo giá]           │
│ Người thực hiện Chủ cửa hàng · 09:15 18/09/2026                               │
│ Bản ghi: vehicle-001                                                          │
│ Giá cũ 650.000 ₫ · Giá mới 600.000 ₫ · Lý do Khách quen                       │
│ ───────────────────────────────────────────────────────────────────────────  │
│ Khóa nhân viên                                            [Tài khoản]         │
│ Người thực hiện Chủ cửa hàng · 09:10 18/09/2026 · Tên đăng nhập nv.lan        │
└──────────────────────────────────────────────────────────────────────────────┘
```

- Newest first, page size 50 (max 200), filters by entity type, action and business day
  (Asia/Ho_Chi_Minh).
- Money-like metadata (`before`, `after`, `amountVnd`) is rendered as VND; other metadata as
  text. Sensitive actions (price override, lock, password reset) use the danger tone.
- Staff never sees the navigation item and receives 403 on the API.

## Accessibility sweep (all routes)

Every workspace route and the login page pass axe (WCAG 2.2 AA, no serious/critical), have one
`h1`, no horizontal overflow and a keyboard-focusable region for any table that scrolls
sideways at 360 px. Brand text on the soft brand background uses the pressed brand colour so
badges and the active navigation item reach 4.5:1.
