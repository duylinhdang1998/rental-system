# 01 — Login

**Story:** US-001  
**Real in Sprint 1:** authentication/session, account lock response, locale  
**Demo:** sample accounts and downstream content

## Desktop

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ MotoRental                                              [VI ▾]  Trợ giúp     │
├─────────────────────────────────┬────────────────────────────────────────────┤
│                                 │                                            │
│  [Soft illustration: scooter]   │  Chào mừng trở lại                        │
│                                 │  Đăng nhập để quản lý cửa hàng             │
│  Mọi chuyến thuê,               │                                            │
│  gọn trong một nơi.             │  Email / tên đăng nhập                     │
│                                 │  [____________________________________]    │
│  • Theo dõi xe hôm nay          │  Mật khẩu                                  │
│  • Kiểm soát hợp đồng           │  [_______________________________] [👁]    │
│  • Đối soát rõ ràng             │  [ ] Ghi nhớ phiên hợp lệ                   │
│                                 │  [              Đăng nhập               ]  │
│                                 │                                            │
│                                 │  ┌ Dữ liệu minh họa ────────────────────┐  │
│                                 │  │ Chủ: owner.demo / ••••••••           │  │
│                                 │  │ Nhân viên: staff.demo / ••••••••     │  │
│                                 │  └──────────────────────────────────────┘  │
└─────────────────────────────────┴────────────────────────────────────────────┘
```

## Mobile

```text
┌──────────────────────────────┐
│ MotoRental           [VI ▾]  │
│                              │
│       [scooter mark]         │
│ Chào mừng trở lại            │
│ Đăng nhập để quản lý cửa hàng│
│                              │
│ Email / tên đăng nhập        │
│ [__________________________] │
│ Mật khẩu                     │
│ [______________________] [👁]│
│ [ ] Ghi nhớ phiên hợp lệ     │
│ [        Đăng nhập         ] │
│                              │
│ [Dữ liệu minh họa ▾]         │
│ Trợ giúp                     │
└──────────────────────────────┘
```

## States and interactions

- Invalid credentials: generic inline alert “Thông tin đăng nhập không đúng.”; do not identify whether account exists.
- Too many attempts: generic rate-limit message with retry time; submit disabled only until countdown expires.
- Locked staff: “Tài khoản hiện không thể truy cập. Liên hệ Chủ cửa hàng.”
- Submit focuses first invalid field; pressing Enter submits; password reveal has accessible label.
- Successful login rotates session and returns to intended allowed route or Dashboard.
