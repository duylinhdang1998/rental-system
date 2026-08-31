# Tech Stack — Hệ thống quản lý cho thuê xe máy

**Author:** CTO  
**Date:** 2026-08-31  
**Status:** APPROVED DIRECTION — React SPA, NestJS and Soft Modern UI selected by client

## Stack Summary

| Layer | Technology | Version Policy | Rationale |
|---|---|---|---|
| Admin frontend | React SPA + Vite | Current supported stable, pinned in lockfile | Dashboard quản trị không cần SSR; dev/build nhanh và đơn giản |
| Routing | React Router | Current stable major, pinned in lockfile | Client routing và role-aware route composition |
| Server state | TanStack Query | Current stable major, pinned in lockfile | Fetch/cache/invalidation và trạng thái request rõ ràng |
| Data grids | TanStack Table | Current stable major, pinned in lockfile | Headless sorting/filtering/pagination, giữ toàn quyền Soft Modern UI |
| Language | TypeScript strict | Current supported stable | Giảm lỗi dữ liệu và hợp đồng API |
| Styling | Tailwind CSS + CSS variables | Current supported stable | Áp design tokens nhất quán, responsive nhanh |
| UI primitives | Radix Primitives + custom typed components | Pinned | Accessible headless behavior, không áp giao diện mặc định lên UI số 3 |
| Component variants | Class Variance Authority + clsx + tailwind-merge | Pinned | Variant có type và tránh class xung đột |
| Icons | Lucide React | Pinned | Icon rõ, nhẹ và tree-shakeable |
| Frontend forms | React Hook Form + Zod | Pinned | Form state gọn và validation runtime phía trình duyệt |
| Localization | i18next + react-i18next | Pinned | Việt–Anh từ nền tảng, namespace theo feature |
| Dates/currency | date-fns + Intl APIs | Pinned/native | Hiển thị locale-aware, logic thời gian không nằm trong component |
| Charts | Recharts | Pinned | Dashboard/report chart responsive; luôn có text/table fallback |
| Feedback | Sonner | Pinned | Toast nhẹ cho phản hồi tạm thời; lỗi cần xử lý vẫn hiển thị inline |
| Server/API | NestJS + TypeScript | Current supported stable | Module/DI/guard/pipe rõ ràng, toàn bộ stack dùng TypeScript |
| API contract/client | NestJS OpenAPI (`@nestjs/swagger`) + Orval | Pinned | Sinh TypeScript fetch/Query client từ contract, tránh type FE/BE trôi lệch |
| ORM | Prisma | Current supported stable | Schema, migration và type-safe queries |
| Database | PostgreSQL | Managed supported release | ACID cho availability, hợp đồng và tiền |
| Authentication | Database-backed secure session cookie + Argon2 | Internal contract | Revoke session khi khóa nhân viên; không để token dài hạn ở client |
| File storage | S3-compatible private object storage | Managed | Ảnh xe/giấy tờ/PDF với signed URL |
| Unit/integration tests | Vitest + Testing Library + MSW | Pinned | Test component/request behavior mà không phụ thuộc môi trường thật |
| E2E | Playwright | Pinned | Desktop/mobile browser acceptance tests |
| CI/CD | GitHub Actions | Managed | Lint, typecheck, test, build trước deploy |
| Deployment | Static admin hosting + managed NestJS API + managed PostgreSQL | Provider chosen before production | Tách frontend/backend, scale và deploy độc lập |
| Optional landing | Separate prerendered/static site | Decide when landing scope is confirmed | Giữ admin thuần SPA nhưng vẫn có SEO cho marketing site |

## Architecture Choice

**Pattern:** Modular backend monolith + React SPA frontend in a workspace repository.

- Không dùng microservices trong MVP.
- Admin và API deploy độc lập nhưng dùng chung typed API contracts.
- UI preview Sprint 1 nằm trong cùng cấu trúc React module sẽ dùng cho production.
- Dữ liệu demo đi qua API namespace riêng có banner; các sprint sau thay demo handlers bằng application services thật.
- Logic giá, availability, contract lifecycle và finance không đặt trong component React.

## Frontend

- React SPA được build bằng Vite; không SSR cho trang quản trị.
- React Router quản lý route và route-level UX guards; API vẫn kiểm tra quyền thật.
- TanStack Query quản lý server state; local UI state giữ gần component.
- TanStack Table quản lý state/logic bảng nhưng markup vẫn do design system kiểm soát.
- Radix chỉ cung cấp behavior/accessibility cho dialog, select, popover, tooltip; không dùng theme mặc định.
- React Hook Form + Zod dùng cho validation form phía frontend; `react-i18next` cho dictionary Việt–Anh.
- Backend DTO dùng NestJS `ValidationPipe`; OpenAPI được sinh từ API và Orval tạo client/types cho frontend.
- Recharts chỉ nạp ở route dashboard/report; chart luôn có text/table thay thế.
- Không thêm Redux/Zustand ở Sprint 1; chỉ bổ sung khi xuất hiện client state xuyên nhiều route mà URL/local state không giải quyết tốt.
- Design tokens trong `.project/design-system.md` ánh xạ sang CSS variables.
- Mobile-first; desktop sidebar và mobile bottom navigation dùng cùng route model.
- i18n từ dictionary typed; mặc định `vi`, tùy chọn `en`.
- Không dùng arbitrary color/spacing ngoài design system sau khi được duyệt.

## Backend and Data

- NestJS controllers gọi application services; frontend không query DB trực tiếp.
- Guards xử lý authentication/authorization, pipes xử lý DTO validation, interceptors/filters xử lý context và lỗi; domain không phụ thuộc NestJS.
- PostgreSQL transaction cho tạo hợp đồng, giữ xe, trả xe và thanh toán.
- Prisma migrations được review và chạy qua CI/staging.
- Tiền lưu integer VND; timestamps lưu UTC, hiển thị theo Asia/Ho_Chi_Minh.
- Rate-limit store local chỉ hợp lệ ở single-instance development/staging. Trước khi scale nhiều API replica phải dùng shared counter store hoặc edge rate-limit có tính nhất quán.
- Queue được hoãn đến khi PDF/background jobs có use case thật; Redis không bị cấm nếu hạ tầng production cần shared throttle/session control.

## Authentication and Authorization

- Session ID ngẫu nhiên trong cookie `HttpOnly`, `Secure`, `SameSite=Lax`.
- Session được lưu server-side để có thể revoke khi khóa tài khoản.
- Password dùng Argon2id với cấu hình được benchmark khi triển khai.
- Authorization policy kiểm tra role, ownership và trạng thái hợp đồng ở server.
- Navigation filtering chỉ là UX; không thay thế authorization.

## Sprint 1 Demo Data Contract

- Dữ liệu demo chỉ dùng ở development/staging.
- Banner “Dữ liệu minh họa” luôn hiển thị trên các trang preview.
- Không có mutation nghiệp vụ giả; CTA chưa triển khai hiển thị trạng thái “Sẽ có ở sprint sau”.
- Seed gồm một Chủ, một Nhân viên, các trạng thái xe/hợp đồng tiêu biểu và dữ liệu dashboard.
- Production API không bao giờ mount demo namespace. Nếu `DEMO_MODE` được bật trong production, validation lúc khởi động/deploy phải thất bại thay vì cho phép ứng dụng chạy.

## Optional Landing Page

- Landing page không nằm trong Sprint 1.
- Khi được xác nhận, landing là một app riêng trong workspace, có prerender/static generation để SEO tốt.
- Landing chỉ dùng chung brand tokens và public API contracts; không import code của admin dashboard.
- Lựa chọn giữa static React prerender hoặc framework marketing chuyên dụng sẽ được chốt theo yêu cầu SEO/content, không kéo SSR vào admin.

## Infrastructure

- `development`, `test`, `staging`, `production` tách config và database.
- CI chạy format check, lint, typecheck, unit/integration test, E2E smoke và build.
- Preview/staging deploy dùng để người dùng duyệt UI.
- Secret chỉ qua environment/secret manager; không commit `.env`.
- Backup production hằng ngày và restore drill trước go-live.

## ADRs

### ADR-001 — React SPA + modular NestJS API

- **Context:** Nghiệp vụ có transaction xuyên xe–hợp đồng–thanh toán nhưng đội nhỏ.
- **Decision:** Admin React SPA và một NestJS API modular monolith, deploy độc lập.
- **Consequences:** Không cần SSR cho quản trị, frontend/backend phân công rõ; cần typed contracts và CORS/cookie config đúng.

### ADR-002 — Sprint 1 UI vertical slice

- **Context:** Người dùng muốn xem UI trước các sprint nghiệp vụ.
- **Decision:** Xây app shell và preview screens bằng demo provider có nhãn.
- **Consequences:** Có feedback sớm; không được coi demo data là hoàn thành backend.

### ADR-003 — Shared abuse counters follow deployment topology

- **Context:** `@nestjs/throttler` dùng memory phù hợp một instance nhưng không tạo giới hạn tổng khi có nhiều replica.
- **Decision:** Sprint 1 tạo abstraction và test policy; local store chỉ dùng single-instance. Production nhiều replica bắt buộc shared store/managed edge limiter.
- **Consequences:** Không thêm Redis vô cớ cho local preview nhưng không được scale ngang với limiter rời rạc.

### ADR-004 — DDoS defense is layered

- **Context:** NestJS rate limit không chặn được volumetric/network flood trước khi traffic chạm origin.
- **Decision:** Production đặt CDN/DDoS/WAF và load balancer trước NestJS, đồng thời khóa truy cập trực tiếp origin.
- **Consequences:** Hosting phải hỗ trợ edge controls; checklist trong `security.md` là go-live gate.

## Approval Needed

Hướng React SPA + NestJS API và UI Soft Modern đã được người dùng xác nhận. Danh sách thư viện FE ở trên là baseline Sprint 1; version chính xác được khóa khi scaffold. Hosting provider và công nghệ landing page sẽ được chốt khi chuẩn bị staging/landing scope.
