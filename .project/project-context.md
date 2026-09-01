# Project Context — Hệ thống quản lý cho thuê xe máy

## Client Q&A History

### Session 1 — 2026-08-31

**Yêu cầu:** Lập kế hoạch triển khai dựa trên workbook `Danh_sach_chuc_nang_thue_xe_may.xlsx`.

**Kết quả:** Đã phân tích 83 chức năng, gồm 71 mục ưu tiên 1 và 12 mục ưu tiên 2; đã tạo `.project/implementation-plan.md`.

### Session 2 — 2026-08-31

**Yêu cầu:** Thực hiện Sprint 0 và Sprint 1 trước để xem UI, sau đó mới tiếp tục các sprint còn lại.

**Quyết định đã ghi nhận:**

- Thực hiện Sprint 0 trước.
- Sprint 1 ưu tiên một vertical slice UI có thể xem và thao tác trên desktop/mobile.
- Không triển khai Sprint 2 trở đi trước khi người dùng duyệt UI Sprint 1.
- Wireframes và design system là bắt buộc trong Sprint 0.

### Session 3 — 2026-08-31

**Yêu cầu:** Xem ba ảnh Dashboard theo ba phong cách trước khi lựa chọn; đổi admin sang React SPA vì không cần SSR; có khả năng thêm landing page; chia công việc thành hai backend và hai frontend workstreams.

**Kết quả:** Đã tạo ba mockup trực quan, cập nhật React + Vite admin, Node API riêng và team allocation 2 BE/2 FE. Landing page được tách riêng để có thể prerender/static khi xác nhận phạm vi.

### Session 4 — 2026-08-31

**Yêu cầu:** Chọn UI số 3; backend dùng NestJS để TypeScript đầy đủ; phải có kế hoạch bảo mật backend gồm rate limit, chống brute force/DDoS và hỏi danh sách thư viện frontend.

**Kết quả:** Khóa hướng Soft Modern Operations, NestJS API và FE headless stack; bổ sung design system, wireframes Sprint 1 và kế hoạch bảo mật nhiều lớp. Chống DDoS được tách đúng trách nhiệm giữa edge/WAF và NestJS application controls.

### Session 5 — 2026-08-31

**Yêu cầu:** “Oke thực hiện sprint 0 nhé”.

**Kết quả:** Người dùng cho phép tiếp tục thực hiện Sprint 0. Artifact review đã LGTM,
roadmap/backlog Sprint 0–7 đã hoàn tất và Gate 1 preflight đạt phần cấu trúc. Việc phát
triển vẫn chờ phê duyệt rõ ràng đối với design system/wireframes, roadmap và BDD Sprint 1.

### Session 6 — 2026-08-31

**Yêu cầu:** Lưu hai workbook khách hàng gửi để dùng cho các chức năng sau.

**Kết quả:** Đã lưu nguyên bản trong `.project/client-inputs/private/2026-08-31/`,
kiểm tra checksum và ghi registry. `Book1.xlsx` là mẫu báo cáo doanh thu ngày;
`danh sach xe tra.xlsx` là mẫu lịch trả xe. Hai file có dữ liệu cá nhân nên không được
dùng trực tiếp trong test/demo; phải tạo fixture ẩn danh.

### Session 7 — 2026-08-31

**Yêu cầu:** “Oke thực hiện nốt sprint 0 và sang sprint 1 nhé”.

**Quyết định:** Phê duyệt Gate 1, gồm SRS/user stories, UI 3 Soft Modern, design
system, wireframes, tech stack/team, roadmap Sprint 0–7 và 15 kịch bản BDD Sprint 1.
Cho phép bắt đầu Sprint 1. Sprint 2+ vẫn dừng sau Sprint 1 để duyệt UI. Các quyết định
nghiệp vụ PD-04–PD-09 được chấp nhận là dependency hoãn đến trước sprint liên quan,
không chặn UI preview Sprint 1.

### Session 8 — 2026-09-01

**Yêu cầu:** Hoàn tất Sprint 0 và thực hiện Sprint 1.

**Kết quả:** Sprint 0 đã đóng tại Gate 1. Sprint 1 đã hoàn tất React SPA responsive,
NestJS API, Prisma contract, đăng nhập/phiên/RBAC/CSRF/rate limit, dashboard và các màn
hình preview VI/EN. Code review LGTM; QA PASS với 21 kiểm thử unit/integration, 10 kiểm
thử trình duyệt và bốn chỉ số coverage đều trên 80%. Sprint 2+ tiếp tục tạm dừng để người
dùng duyệt UI Sprint 1.

### Session 9 — 2026-09-01

**Yêu cầu:** Nếu Sprint 1 xong thì chạy Sprint 2 và Sprint 3, commit code lên
`https://github.com/duylinhdang1998/rental-system`.

**Kết quả hiện tại:** Repository trống đã nhận baseline Sprint 0–1 tại commit `fe5e1e9`;
hai workbook riêng tư được xác nhận không vào Git. Sprint 2–3 được mở Batch 0. BDD,
wireframe CRUD/lập hợp đồng và blueprint file đã được soạn; Batch 1 chờ phê duyệt bắt buộc.

### Session 10 — 2026-09-01

**Phản hồi:** Duyệt MVP một cửa hàng, quyền cấu hình/override và bảng giá cấu hình. Yêu
cầu lịch trực quan như đặt phòng họp/khách sạn để xem ngày xe còn trống. Cần giải thích
dễ hiểu hơn về quy tắc block 24 giờ/ân hạn và mục đích PDF hợp đồng.

**Xử lý:** Sprint 2 được duyệt triển khai. BDD/wireframe bổ sung availability calendar
theo xe × ngày, với Trống/Đang giữ/Đã có lịch thuê/Bảo dưỡng bằng biểu tượng + chữ. Quy
tắc 60 phút và mẫu PDF hệ thống được giải thích lại. Vì khách hàng đã cho phép chạy
Sprint 3, các mặc định này được dùng cho phiên bản đầu và vẫn có thể cấu hình/thay mẫu sau.

### Session 11 — 2026-09-01

**Kết quả Sprint 2:** Hoàn tất quản lý xe/khách hàng, lịch trống kiểu đặt phòng, kiểm soát
chuyển trạng thái có lý do, lịch sử bất biến, cảnh báo blacklist và dữ liệu giấy tờ riêng tư.
Code review LGTM; QA PASS với 34 kiểm thử unit/integration, 15 hành trình trình duyệt và
bốn chỉ số coverage đều trên 80%. Sprint 3 được mở với MVP một cửa hàng, block 24 giờ,
60 phút linh động và mẫu hợp đồng PDF Việt–Anh do hệ thống tạo.

## Client Preferences

- Ngôn ngữ trao đổi: Tiếng Việt.
- Sản phẩm: Web app responsive, dùng tốt trên điện thoại.
- Cách triển khai: Xem và duyệt UI sớm trước khi mở rộng nghiệp vụ.
- Giao diện: UI số 3 — Soft Modern Operations.
- Frontend admin: React SPA, không SSR.
- Backend: NestJS + TypeScript.
- Bảo mật: defense-in-depth; rate limit/CSRF/RBAC/validation ở API và DDoS/WAF ở edge.
- Team allocation: 2 backend workstreams và 2 frontend workstreams.

## Confirmed Product Facts

- Vai trò ban đầu: Chủ và Nhân viên.
- Một hợp đồng có thể chứa nhiều xe.
- Một xe trong hợp đồng có thể được trả riêng.
- Giá thuê có bậc theo số ngày và có thể sửa tay nếu ghi lý do.
- Hợp đồng hỗ trợ cọc tiền, giữ giấy tờ, phí giao xe và ảnh bàn giao.
- Thanh toán có thể nhiều lần và kết hợp tiền mặt/chuyển khoản.
- Hệ thống phải có nhật ký thao tác, sao lưu hằng ngày và giao diện Việt–Anh.

## Pending Decisions

| ID | Decision | Recommended Default | Status |
|---|---|---|---|
| PD-01 | Phong cách thiết kế | UI 3 — Soft Modern Operations | Approved and implemented in Sprint 1 |
| PD-02 | Tech stack | React + Vite admin, NestJS API, PostgreSQL + Prisma | Approved direction |
| PD-03 | Cơ cấu thực hiện | 2 backend, 2 frontend + UX/QA/review/DevOps | Approved allocation |
| PD-04 | Một hay nhiều chi nhánh | Một chi nhánh trong MVP | Approved |
| PD-05 | Cách tính ngày thuê | Block 24 giờ, linh động thêm tối đa 60 phút trước khi tính block kế tiếp | Accepted as Sprint 3 default |
| PD-06 | Cách tính giá khi gia hạn | Tính lại toàn bộ thời gian theo bậc cuối | Deferred to Sprint 4; not implemented in Sprint 3 |
| PD-07 | Đặt trước xe đang thuê | Cho phép nếu không trùng khoảng `[start,end)` | Accepted as Sprint 3 default |
| PD-08 | Nhập Excel cũ khi go-live | Chuyển lên MVP nếu có dữ liệu đang vận hành | Pending |
| PD-09 | Mẫu hợp đồng Việt–Anh | Template hệ thống Sprint 3, thay bằng mẫu khách hàng khi nhận | Accepted as Sprint 3 default |
| PD-10 | Mẫu báo cáo doanh thu ngày | Đã lưu `daily-revenue-report-sample.xlsx` | Received |
| PD-11 | Mẫu lịch trả xe | Đã lưu `vehicle-return-schedule-sample.xlsx` | Received |

## Design Decisions

| Decision | Rationale | Date | Status |
|---|---|---|---|
| Modular monolith | Phù hợp MVP, giảm vận hành nhưng giữ ranh giới nghiệp vụ | 2026-08-31 | Approved and implemented |
| UI vertical slice in Sprint 1 | Người dùng muốn duyệt UI trước các sprint nghiệp vụ | 2026-08-31 | Approved intent |
| Server-side authorization | Không dựa vào việc ẩn nút để bảo vệ dữ liệu | 2026-08-31 | Implemented for Sprint 1 |
| Immutable financial history | Tránh sai lệch khi sửa giao dịch/hợp đồng cũ | 2026-08-31 | Proposed |
| React SPA cho admin | Hệ thống quản trị không cần SSR | 2026-08-31 | Approved by client |
| Landing page tách riêng | Cho phép prerender/SEO mà không đổi kiến trúc admin | 2026-08-31 | Approved direction |
| Hai backend và hai frontend workstreams | Chia ownership và tăng thông lượng khi triển khai | 2026-08-31 | Approved by client |
| NestJS backend | Dùng TypeScript xuyên stack, module/guard/pipe rõ ràng | 2026-08-31 | Approved by client |
| Security nhiều lớp | NestJS throttling không thay thế edge DDoS/WAF | 2026-08-31 | Approved requirement |
| Soft Modern Operations | Dựa trên UI số 3, tăng contrast/mật độ cho vận hành | 2026-08-31 | Selected by client |

## Scope Changes

| Change | Impact | Status | Date |
|---|---|---|---|
| Ưu tiên UI shell và màn hình demo trong Sprint 1 | Đưa một phần UI các module lên trước; nghiệp vụ thật vẫn theo roadmap sau | Approved by client | 2026-08-31 |

## Sprint 0 Decisions

- Wireframes = Yes
- Design Direction = UI 3 selected; design system/wireframes approved
- Tech Stack = React SPA + NestJS API approved
- Team = 2 Backend + 2 Frontend approved; support roles retained
- Roadmap = Sprint 0–7 approved; Sprint 2+ execution remains deferred after Sprint 1
