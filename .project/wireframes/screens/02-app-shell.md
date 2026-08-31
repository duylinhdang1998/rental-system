# 02 — Responsive App Shell

**Stories:** US-002, US-004, US-005  
**Roles:** Owner and Staff

## Desktop shell

```text
┌───────────────┬──────────────────────────────────────────────────────────────┐
│ MotoRental    │ [☰]  Dashboard                           [VI ▾] [🔔] [DL ▾] │
│               ├──────────────────────────────────────────────────────────────┤
│ [●] Dashboard │ ⚗ Dữ liệu minh họa — thao tác nghiệp vụ chưa được lưu thật. │
│ [ ] Xe        ├──────────────────────────────────────────────────────────────┤
│ [ ] Khách hàng│                                                              │
│ [ ] Hợp đồng  │  Breadcrumb / Page title                     [Primary action]│
│ [ ] Trả xe    │  Optional description                                         │
│ [ ] Báo cáo * │                                                              │
│               │  Main route content                                          │
│ QUẢN TRỊ *    │                                                              │
│ [ ] Nhân viên │                                                              │
│ [ ] Cài đặt   │                                                              │
│               │                                                              │
│ [avatar] User │                                                              │
└───────────────┴──────────────────────────────────────────────────────────────┘
* Owner only
```

## Mobile shell

```text
┌──────────────────────────────┐
│ MotoRental    [🔔] [avatar]  │
├──────────────────────────────┤
│ ⚗ Dữ liệu minh họa           │
├──────────────────────────────┤
│ Dashboard                    │
│ Content scroll area          │
│                              │
│                              │
├──────────────────────────────┤
│ 🏠      🛵      📄      •••   │
│ Tổng quan Xe   Hợp đồng Thêm │
└──────────────────────────────┘
```

## Role navigation

| Route | Owner | Staff | Sprint 1 content |
|---|---:|---:|---|
| Dashboard | Yes | Yes | Demo operational overview |
| Xe | Yes | Yes | Preview |
| Khách hàng | Yes | Yes | Preview |
| Hợp đồng | Yes | Yes | Preview |
| Trả xe | Yes | Yes | Preview |
| Báo cáo | Yes | No | Owner preview |
| Nhân viên | Yes | No | Owner preview |
| Cài đặt | Yes | No | Owner preview |

## Behavior

- Skip link moves keyboard focus to `main`.
- Sidebar can collapse but preference is not required in Sprint 1.
- Mobile “Thêm” opens a bottom sheet containing customer, returns and Owner-only routes.
- Route loading keeps shell stable and shows content skeleton only.
- Client navigation is filtered by role; direct URL still calls protected NestJS endpoint and renders denied state on `403`.
