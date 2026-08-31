# 05 — View States, Access and Feedback

## Loading

```text
Page header remains visible
[skeleton KPI] [skeleton KPI] [skeleton KPI]
[skeleton table/card rows]
```

- Skeleton shapes match final content; no indefinite global spinner.
- Route shell remains interactive; `aria-busy` is scoped to changing content.

## Empty

```text
┌─────────────────────────────────────────┐
│ [context icon]                          │
│ Chưa có hợp đồng phù hợp                │
│ Thử bỏ bộ lọc hoặc đổi khoảng thời gian.│
│ [Xóa bộ lọc]                            │
└─────────────────────────────────────────┘
```

- Distinguish “no records exist” from “filters returned nothing”.

## Recoverable error

```text
┌─────────────────────────────────────────┐
│ Không tải được dữ liệu                  │
│ Mã yêu cầu: req_…                       │
│ [Thử lại] [Quay về Dashboard]           │
└─────────────────────────────────────────┘
```

- No stack trace or raw server message. Error ID supports operational diagnosis.

## Access denied (`403`)

```text
┌─────────────────────────────────────────┐
│ [lock icon]                             │
│ Bạn không có quyền xem trang này        │
│ Tài khoản Nhân viên không xem Báo cáo.  │
│ [Về Dashboard]                          │
└─────────────────────────────────────────┘
```

- A hidden nav item never replaces server authorization.

## Session expired (`401`)

- Show a focused dialog, preserve intended path, then return to Login.
- Do not silently retry state-changing requests after re-authentication.

## Disabled future action

- Control is visibly disabled and adjacent helper/tooltip states “Có trong Sprint N”.
- Never show a success toast for an action that does not persist.

## Locale behavior

- Language control exposes “Tiếng Việt” and “English”, persists locally and updates visible labels immediately.
- User/customer data is not translated.
- Dates and currency use locale-aware format; source timestamps stay UTC.
