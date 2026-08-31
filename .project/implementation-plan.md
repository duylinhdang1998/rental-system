# Kế hoạch triển khai hệ thống quản lý cho thuê xe máy

**Trạng thái:** Bản kế hoạch dự thảo để xác nhận phạm vi  
**Nguồn:** `Danh_sach_chuc_nang_thue_xe_may.xlsx`  
**Ngày lập:** 2026-08-31

## 1. Tóm tắt điều hành

Xây dựng một web app nội bộ, tối ưu cho cả máy tính và điện thoại, phục vụ toàn bộ vòng đời cho thuê xe máy: quản lý nhân viên, xe, khách hàng, hợp đồng nhiều xe, giao/nhận xe, thanh toán, công nợ, báo cáo và kiểm soát dữ liệu.

Workbook có **83 chức năng**:

- **71 chức năng ưu tiên 1:** phạm vi MVP để vận hành thực tế.
- **12 chức năng ưu tiên 2:** giai đoạn tối ưu tài chính, tài sản và báo cáo nâng cao.
- **2 vai trò ban đầu:** Chủ và Nhân viên.
- **Hiện trạng:** 0 chức năng được đánh dấu hoàn thành; repository chưa có mã ứng dụng.

Đề xuất triển khai theo kiến trúc **modular monolith** để đi nhanh nhưng vẫn tách rõ nghiệp vụ. Với đội 2 lập trình viên, QA bán thời gian và BA/UX/DevOps theo từng giai đoạn, MVP dự kiến **14–16 tuần**, sau đó giai đoạn 2 cần thêm **4–6 tuần**. Nếu chỉ có 1 lập trình viên toàn thời gian, nên dự trù **24–30 tuần** cho MVP.

## 2. Các điểm cần chuẩn hóa trước khi phát triển

1. Mã `CN-4.01` đến `CN-4.04` đang bị dùng lặp ở hai nhóm 4.1 và 4.2. Cần đổi nhóm vòng đời hợp đồng thành mã duy nhất, ví dụ `CN-4.14` đến `CN-4.17`.
2. Đã nhận mẫu “Báo cáo doanh thu ngày” và “Lịch trả xe”; chúng là baseline cho Sprint 4–6. Trước BDD của sprint liên quan vẫn phải xác nhận quy tắc tổng, định dạng xuất và dữ liệu nào được phép hiển thị.
3. “Nhập dữ liệu từ Excel cũ” đang là ưu tiên 2. Nếu cần mang dữ liệu lịch sử sang hệ thống khi go-live, phải chuyển mục này lên MVP.
4. Cần chốt cách tính ngày thuê: theo 24 giờ, theo ngày lịch, hay theo giờ nhận/trả; quy tắc làm tròn ảnh hưởng trực tiếp đến giá thuê và phí trễ.
5. Cần chốt cách áp dụng bảng giá theo bậc ngày khi gia hạn: tính lại toàn bộ thời gian thuê hay chỉ phần ngày tăng thêm.
6. Cần chốt một xe có thể được đặt trước trong tương lai khi hiện đang cho thuê hay không; nếu có, hệ thống phải kiểm tra trùng khoảng thời gian thay vì chỉ nhìn trạng thái hiện tại.
7. Cần chốt chính sách xóa dữ liệu. Đề xuất không xóa cứng hợp đồng, thanh toán và nhật ký; chỉ hủy/khóa và lưu lý do.

## 3. Phạm vi sản phẩm

### 3.1 MVP — ưu tiên 1

| Khối nghiệp vụ | Phạm vi chính | Kết quả vận hành |
|---|---|---|
| Tài khoản và nhân viên | Đăng nhập, Chủ/Nhân viên, khóa tài khoản, đổi/reset mật khẩu | Nhân viên chỉ làm đúng phần được phép |
| Xe cho thuê | Hồ sơ xe, ảnh, trạng thái, tìm/lọc, lịch sử, doanh thu theo xe | Biết xe nào sẵn sàng và lịch sử khai thác |
| Khách hàng | Hồ sơ, kênh liên hệ, giấy tờ, nhãn, blacklist, lịch sử, thống kê | Tìm khách cũ nhanh và cảnh báo rủi ro |
| Danh mục và bảng giá | Loại xe, giấy tờ, nhãn, đối tác, giá thuê, phí trễ, thông tin cửa hàng | Chủ tự cấu hình mà không cần sửa mã nguồn |
| Hợp đồng | Một hợp đồng nhiều xe, giá theo bậc ngày, cọc/giấy tờ, phí giao xe, ảnh bàn giao, PDF Việt–Anh | Lập hợp đồng nhanh và có chứng từ đầy đủ |
| Vòng đời hợp đồng | Đặt trước, đang thuê, quá hạn, đã trả, hủy; gia hạn và đổi xe | Theo dõi chính xác trạng thái từng xe và hợp đồng |
| Nhận/trả xe | Xe trả hôm nay, quá hạn, trả lẻ, phụ phí, tất toán, đổi trạng thái xe | Quầy vận hành được toàn bộ quy trình cuối chuyến |
| Thanh toán và công nợ | Tiền mặt/chuyển khoản/kết hợp, thu nhiều lần, số còn thiếu, tổng thu ngày | Mọi khoản thu truy vết được và đối chiếu được |
| Báo cáo | Doanh thu ngày/kỳ, công nợ, nhân viên, xuất Excel | Chủ theo dõi vận hành và tải dữ liệu |
| Hệ thống | Nhật ký, responsive mobile, Việt–Anh, sao lưu hằng ngày | An toàn dữ liệu và dùng được khi đi giao xe |

### 3.2 Giai đoạn 2 — ưu tiên 2

- Giá vốn, khấu hao và điểm hòa vốn từng xe.
- Ảnh xe lúc nhận về; danh mục và bảng giá hư hỏng.
- Chốt ca tiền mặt, hoàn tiền cọc và quản lý chi.
- Báo cáo doanh thu đa chiều, tỷ lệ sử dụng xe, lãi/lỗ, phụ phí và biểu đồ xu hướng.
- Nhập dữ liệu lịch sử từ Excel cũ, nếu không được chuyển lên MVP.

### 3.3 Ngoài phạm vi hiện tại

Các mục sau không có trong workbook và được coi là ngoài phạm vi cho đến khi có yêu cầu thay đổi:

- Ứng dụng iOS/Android native; MVP là web responsive.
- Chế độ offline hoàn toàn.
- Website đặt xe công khai cho khách hàng.
- Thanh toán trực tuyến hoặc tích hợp ngân hàng.
- Hóa đơn điện tử, kê khai thuế hoặc kết nối phần mềm kế toán.
- GPS/IoT theo dõi xe.
- Mô hình nhiều chi nhánh/kho xe.
- Tự động gửi Zalo/WhatsApp/SMS/email.

## 4. Luồng nghiệp vụ trọng tâm

### 4.1 Lập hợp đồng

1. Nhân viên tìm hoặc tạo khách hàng.
2. Hệ thống hiển thị nhãn VIP/khách quen/blacklist và cảnh báo liên quan.
3. Nhân viên nhập khoảng thuê; hệ thống chỉ cho chọn xe không bị trùng lịch và có trạng thái hợp lệ.
4. Hệ thống áp dụng bảng giá theo loại xe, số ngày và nhãn khách; giá sửa tay phải lưu lý do và người sửa.
5. Nhân viên ghi cọc, giấy tờ giữ, nơi giao, phí giao, ảnh xe, mức xăng và ghi chú.
6. Hệ thống tạo mã hợp đồng, khóa ảnh chụp giá tại thời điểm lập và xuất PDF song ngữ.
7. Xe được chuyển sang Đang đặt trước hoặc Đang cho thuê tùy thời điểm.

### 4.2 Gia hạn hoặc đổi xe

1. Kiểm tra xe và khoảng thời gian mới có bị trùng lịch hay không.
2. Tính lại tiền theo chính sách đã được Chủ cấu hình.
3. Lưu lịch sử giá cũ/mới, người thao tác và lý do.
4. Khi đổi xe, kết thúc dòng xe cũ và tạo dòng xe thay thế; không ghi đè mất lịch sử.

### 4.3 Trả xe và tất toán

1. Nhân viên mở danh sách trả hôm nay/quá hạn.
2. Chọn từng xe trong hợp đồng để trả; hợp đồng chỉ đóng khi tất cả xe đã trả hoặc được xử lý.
3. Ghi thời điểm trả, tình trạng, mức xăng, phụ phí trễ/hư hỏng/khác.
4. Hệ thống tính: tiền thuê + phụ phí − tổng đã thu = còn phải thu hoặc cần hoàn.
5. Xác nhận trả giấy tờ và tiền cọc.
6. Ghi nhận khoản thu/hoàn, người nhận xe và trạng thái mới của xe.
7. Phát sinh đầy đủ nhật ký thao tác và cập nhật báo cáo.

## 5. Kiến trúc kỹ thuật đề xuất

### 5.1 Hướng kiến trúc

- **Mô hình:** modular monolith, chia module theo nghiệp vụ; chưa dùng microservices.
- **Admin web:** React SPA + Vite với TypeScript, responsive mobile-first và hỗ trợ i18n Việt–Anh từ nền tảng; không dùng SSR cho trang quản trị.
- **Backend:** NestJS/TypeScript API riêng, lớp controller + guard/pipe + application service + domain rules; mọi phân quyền được kiểm tra phía server.
- **Landing page tương lai:** tách thành app prerender/static riêng để hỗ trợ SEO mà không ảnh hưởng kiến trúc admin SPA.
- **Cơ sở dữ liệu:** PostgreSQL; ORM/migrations bằng Prisma.
- **Tệp:** object storage riêng tư cho ảnh xe, giấy tờ khách và PDF; truy cập bằng URL có thời hạn.
- **Tác vụ nền:** tạo PDF, sao lưu và các tác vụ dài chạy ngoài request chính.
- **Triển khai:** môi trường development, staging và production tách biệt; CI/CD tự động chạy kiểm tra trước khi triển khai.
- **Quan sát:** log có cấu trúc, theo dõi lỗi, uptime và cảnh báo sao lưu thất bại.

### 5.2 Ranh giới module

```text
Identity & Access
├── Users, employees, roles, permissions, sessions
Fleet
├── Vehicles, types, images, statuses, availability, history
Customers
├── Profiles, contacts, documents, tags, blacklist
Pricing & Configuration
├── Price tiers, late fees, tags, damage items, partners, business profile
Rental Contracts
├── Contracts, vehicle lines, handover, extension, swap, cancellation
Returns & Settlement
├── Partial returns, inspections, charges, deposit/document release
Finance
├── Payments, refunds, receivables, cash shifts, expenses
Reporting
├── Revenue, debt, employees, utilization, exports
Platform
└── Audit, files, PDF, backup, localization, monitoring
```

### 5.3 Mô hình dữ liệu cốt lõi

Các thực thể chính: `User`, `Employee`, `Role`, `Permission`, `Vehicle`, `VehicleType`, `VehicleImage`, `VehicleStatusHistory`, `Customer`, `CustomerContact`, `CustomerDocument`, `CustomerTag`, `PricingTier`, `Contract`, `ContractVehicle`, `ContractStatusHistory`, `HandoverInspection`, `ReturnInspection`, `Charge`, `Payment`, `PaymentAllocation`, `CashShift`, `Expense`, `PartnerReferral`, `AppSetting`, `FileAsset`, `AuditLog`.

Nguyên tắc dữ liệu:

- Tiền lưu bằng số nguyên VND; không dùng số thực.
- Giá, phí và thông tin cấu hình được chụp lại trên hợp đồng để thay đổi bảng giá sau này không làm sai hợp đồng cũ.
- Mỗi xe trong hợp đồng có trạng thái và thời điểm trả riêng để hỗ trợ trả lẻ.
- Khoản thu/hoàn là giao dịch bất biến; sửa sai bằng giao dịch điều chỉnh, không ghi đè lịch sử.
- Kiểm tra xe bận dựa trên khoảng thời gian của từng dòng xe và trạng thái hợp đồng.
- Thời gian nghiệp vụ và báo cáo dùng múi giờ `Asia/Ho_Chi_Minh`.
- Dữ liệu nhạy cảm và tệp giấy tờ không công khai; có phân quyền và nhật ký truy cập/thao tác.

## 6. Roadmap đề xuất

Mỗi sprint phát triển dài 2 tuần, tuân theo 4 lô: kịch bản BDD → phát triển/TDD → code review → QA hồi quy. Kịch bản nghiệp vụ phải được duyệt trước khi viết tính năng tương ứng.

| Giai đoạn | Thời lượng | Mục tiêu | Sản phẩm bàn giao chính |
|---|---:|---|---|
| Sprint 0 — Discovery & UX | 1–2 tuần | Chốt quy tắc nghiệp vụ và hợp đồng UX | SRS, user stories, data model, wireframe, design system, mẫu PDF/report đã duyệt |
| Sprint 1 — Nền tảng | 2 tuần | Có hệ thống đăng nhập và nền dữ liệu an toàn | Auth, Chủ/Nhân viên, nhân viên, cấu hình cơ bản, audit, lưu tệp, i18n nền, CI/CD |
| Sprint 2 — Xe & khách hàng | 2 tuần | Quản lý dữ liệu đầu vào cho hợp đồng | Xe, ảnh, trạng thái, tìm/lọc; khách hàng, liên hệ, giấy tờ, nhãn, blacklist |
| Sprint 3 — Giá & lập hợp đồng | 2 tuần | Tạo được hợp đồng nhiều xe hoàn chỉnh | Availability, bảng giá, tính tiền, cọc/giấy tờ, giao xe, ảnh bàn giao, PDF Việt–Anh |
| Sprint 4 — Vòng đời & vận hành ngày | 2 tuần | Quản lý được đặt trước/đang thuê/quá hạn | Hủy, gia hạn, đổi xe, xe trả hôm nay, quá hạn, đồng bộ trạng thái xe |
| Sprint 5 — Trả xe & tất toán | 2 tuần | Hoàn tất chuyến thuê và kiểm soát số dư | Trả lẻ, phí trễ/phí khác, trả cọc/giấy tờ, tất toán, công nợ |
| Sprint 6 — Thu tiền & báo cáo | 2 tuần | Chủ đối soát được dòng tiền và hiệu quả | Thu nhiều lần/kết hợp, tổng thu ngày, công nợ, báo cáo kỳ/nhân viên, xuất Excel |
| Sprint 7 — Hardening & go-live | 2 tuần | Sẵn sàng dùng thật | Responsive đầy đủ, rà soát Việt–Anh, bảo mật, backup/restore, UAT, dữ liệu ban đầu, đào tạo, triển khai |
| Giai đoạn 2 | 4–6 tuần | Tối ưu tài sản và tài chính | 12 mục ưu tiên 2, QA và phát hành riêng |

### 6.1 Tiêu chí hoàn thành từng sprint

- Acceptance criteria ở dạng Given/When/Then được xác nhận.
- Unit, integration và E2E cho luồng chính đều xanh.
- Build thành công; không có lỗi nghiêm trọng về bảo mật hoặc dữ liệu.
- Code review đạt LGTM.
- QA hồi quy đạt; mục tiêu coverage tối thiểu 80% cho logic nghiệp vụ.
- Với sprint có UI, kiểm thử thực tế trên desktop và viewport điện thoại.
- Staging được cập nhật và có ghi chú phát hành.


## Tài liệu kế hoạch chi tiết

- [Chi tiết công việc Sprint 0–7](planning/roadmap-details.md)
- [Kiểm thử, bảo mật, nhân sự, rủi ro và điều kiện phát hành](planning/quality-and-release.md)

Hai tài liệu trên là một phần của kế hoạch này và phải được đọc cùng roadmap tổng quan.

## 13. Các quyết định nghiệp vụ còn mở

Trước sprint phụ thuộc tương ứng, Chủ cần xác nhận:

1. Hệ thống dùng cho một hay nhiều chi nhánh?
2. Cách tính ngày thuê và giờ trễ chính xác là gì? Có thời gian ân hạn không?
3. Khi gia hạn, giá được tính lại toàn bộ hay chỉ phần tăng thêm?
4. Có cho đặt trước một xe đang được thuê nhưng sẽ trả trước ngày đặt không?
5. Có cần nhập dữ liệu Excel cũ ngay khi go-live không?
6. Vui lòng cung cấp mẫu hợp đồng Việt–Anh trước Sprint 3; mẫu báo cáo doanh thu và lịch trả xe đã nhận ngày 2026-08-31.

Đã chốt trong Sprint 0: web responsive, wireframe/prototype, UI 3 — Soft Modern,
React SPA + NestJS, đội 2 Backend + 2 Frontend và các tích hợp hóa đơn điện tử,
thanh toán trực tuyến/thông báo tự động nằm ngoài MVP hiện tại.

## 14. Bước tiếp theo

1. Chủ duyệt SRS/user stories, design system, wireframes, roadmap Sprint 0–7 và BDD Sprint 1.
2. Ghi nhận câu trả lời cho các quyết định nghiệp vụ còn mở; các quyết định chưa ảnh hưởng Sprint 1 có thể được chốt trước sprint phụ thuộc.
3. QA chạy Gate 1; chỉ khi Gate 1 pass mới tạo test skeleton và bắt đầu Sprint 1.
4. Sau Sprint 1, dừng để Chủ duyệt UI trước khi kích hoạt Sprint 2.
