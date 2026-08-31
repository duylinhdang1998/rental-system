# Software Requirements Specification — Hệ thống quản lý cho thuê xe máy

**Version:** 1.0 Approved Baseline  
**Date:** 2026-08-31  
**Status:** APPROVED FOR SPRINT 1 — open business rules remain gated before dependent sprints

## 1. Introduction

### 1.1 Purpose

Tài liệu mô tả yêu cầu cho web app nội bộ quản lý cho thuê xe máy, dùng làm nguồn sự thật cho thiết kế, phát triển, BDD, QA và UAT.

### 1.2 Product Perspective

Hệ thống thay thế quy trình rời rạc bằng Excel, giấy và trao đổi thủ công. Sản phẩm tập trung vào vận hành tại quầy và khi nhân viên đi giao/nhận xe.

### 1.3 Users

- **Chủ:** toàn quyền, xem doanh thu, cấu hình, nhân viên và audit.
- **Nhân viên:** lập và xử lý hợp đồng trong phạm vi được phép; không xem số liệu tổng hợp nhạy cảm.

### 1.4 Definitions

- **Hợp đồng:** một lượt thuê của một khách, có thể gồm nhiều xe.
- **Dòng xe hợp đồng:** một xe cụ thể trong hợp đồng, có lịch và trạng thái trả riêng.
- **Tất toán:** xác định tổng phải trả, đã thu, còn thiếu hoặc cần hoàn.
- **Availability:** khả năng chọn xe trong một khoảng thời gian mà không trùng thuê/đặt trước.

## 2. Assumptions Pending Approval

- MVP phục vụ một chi nhánh.
- Tiền tệ là VND và lưu theo số nguyên.
- Ngày thuê mặc định tính theo block 24 giờ; có cấu hình thời gian ân hạn.
- Gia hạn tính lại toàn bộ kỳ thuê theo bậc ngày cuối cùng.
- Có thể đặt trước xe đang thuê nếu khoảng thời gian không trùng.
- Sprint 1 dùng dữ liệu demo có nhãn rõ để duyệt UI; không giả lập rằng nghiệp vụ đã hoàn chỉnh.

## 3. Functional Requirements

### FR-01 Identity, Employees and Access

**Priority:** MUST

- FR-01.1 Hệ thống cho phép đăng nhập/đăng xuất và đổi mật khẩu.
- FR-01.2 Chủ tạo, reset và khóa tài khoản Nhân viên.
- FR-01.3 Nhân viên đã nghỉ không đăng nhập được nhưng lịch sử được giữ.
- FR-01.4 Mọi quyền trong ma trận Chủ/Nhân viên phải được kiểm tra phía server.
- FR-01.5 Nhân viên chỉ sửa hợp đồng mình lập, chưa tất toán và trong ngày; Chủ có quyền rộng hơn theo ma trận.

### FR-02 Fleet Management

**Priority:** MUST; giá vốn/khấu hao là SHOULD

- Quản lý mã xe, biển số, loại, hãng, màu, năm sản xuất và ảnh.
- Quản lý trạng thái: sẵn sàng, đang thuê, đặt trước, sửa chữa, hư hỏng, mất, thanh lý.
- Tìm/lọc xe và không cho chọn xe bận trong hợp đồng mới.
- Hiển thị lịch sử thuê và doanh thu lũy kế từng xe.

### FR-03 Customer Management

**Priority:** MUST

- Quản lý hồ sơ, quốc tịch, nhiều kênh liên hệ và giấy tờ.
- Tìm khách cũ theo tên hoặc liên hệ.
- Quản lý nhãn màu, VIP/khách quen/blacklist và lý do cảnh báo.
- Hiển thị lịch sử, tổng lượt thuê, tổng chi tiêu và số lần trả trễ.
- Cho phép giá riêng theo nhãn khách.

### FR-04 Pricing and Configuration

**Priority:** MUST

- Chủ quản lý loại xe, kênh liên hệ, loại giấy tờ, nhãn, bảng giá, phí trễ, hạng mục hư hỏng, đối tác và thông tin hộ kinh doanh.
- Bảng giá hỗ trợ bậc theo số ngày.
- Thay đổi cấu hình không làm thay đổi số liệu hợp đồng đã lập.

### FR-05 Contract Creation

**Priority:** MUST

- Một hợp đồng thuộc một khách và có một hoặc nhiều xe.
- Mã hợp đồng được sinh tự động và duy nhất.
- Nhân viên chọn khách cũ hoặc tạo khách ngay trong luồng lập hợp đồng.
- Hệ thống tính số ngày, giá từng xe, phí giao và tổng hợp đồng.
- Sửa giá tay yêu cầu lý do và lưu người thao tác.
- Ghi cọc tiền, giấy tờ giữ, địa điểm giao, ảnh giao xe, mức xăng, ghi chú và nhân viên phụ trách.
- Xuất hợp đồng PDF song ngữ Việt–Anh.

### FR-06 Contract Lifecycle

**Priority:** MUST

- Trạng thái: đặt trước, đang thuê, quá hạn, đã trả và đã hủy.
- Hủy phải lưu người và lý do.
- Gia hạn phải kiểm tra availability và tính lại giá theo quy tắc đã duyệt.
- Đổi xe phải giữ nguyên lịch sử xe cũ và tạo quan hệ xe thay thế.

### FR-07 Return and Settlement

**Priority:** MUST; ảnh nhận về và bảng giá hư hỏng chi tiết là SHOULD

- Hiển thị xe phải trả hôm nay và xe quá hạn kèm số giờ trễ.
- Hợp đồng nhiều xe cho phép trả từng xe; chỉ đóng khi tất cả dòng xe hoàn tất.
- Tính tiền thuê, phí trễ, hư hỏng, phí khác, đã thu và số còn thu/cần hoàn.
- Xác nhận trả giấy tờ, cọc và nhân viên nhận xe.
- Cập nhật xe về sẵn sàng hoặc sửa chữa theo tình trạng.

### FR-08 Payments and Receivables

**Priority:** MUST; chốt ca, hoàn cọc và quản lý chi là SHOULD

- Ghi nhận tiền mặt, chuyển khoản hoặc kết hợp.
- Cho phép nhiều giao dịch trên một hợp đồng.
- Theo dõi tổng phải thu, đã thu và còn thiếu.
- Hiển thị hợp đồng còn nợ và tổng thu trong ngày theo hình thức.

### FR-09 Reporting

**Priority:** MUST cho báo cáo cơ bản; SHOULD cho báo cáo nâng cao

- Báo cáo doanh thu ngày và theo khoảng thời gian.
- Báo cáo công nợ và hiệu suất nhân viên.
- Xuất báo cáo ra Excel theo mẫu được duyệt.
- Giai đoạn 2 bổ sung doanh thu đa chiều, utilization, lãi/lỗ, phụ phí và xu hướng.

### FR-10 Platform and Data Safety

**Priority:** MUST; import Excel cũ là SHOULD hoặc MUST tùy quyết định migration

- Audit ai tạo/sửa/hủy, thời điểm và giá trị cũ–mới.
- Responsive mobile-first và giao diện Việt–Anh.
- Sao lưu tự động hằng ngày và có khả năng khôi phục đã kiểm thử.
- Nhập dữ liệu Excel cũ khi được đưa vào phạm vi go-live.

### FR-11 Sprint 1 UI Preview

**Priority:** MUST for Sprint 1

- Cung cấp app shell, navigation và các trang preview cho module chính.
- Dashboard hiển thị dữ liệu demo của xe sẵn sàng, đang thuê, trả hôm nay, quá hạn và công nợ.
- Mọi dữ liệu demo phải được ghi nhãn, không gây hiểu nhầm là dữ liệu production.
- Chủ và Nhân viên thấy navigation khác nhau theo quyền demo.
- UI có desktop/mobile, loading, empty, error và access-denied states.

## 4. Non-Functional Requirements

### NFR-01 Performance

- p95 API mục tiêu dưới 500 ms cho thao tác CRUD thông thường ở tải MVP.
- LCP mục tiêu dưới 2.5 giây trên mạng di động tốt cho các màn hình chính.

### NFR-02 Security

- Tuân thủ OWASP Top 10, HTTPS production, validation đầu vào và rate limiting.
- Tệp giấy tờ/ảnh riêng tư; không có public URL vĩnh viễn.
- Không hard-delete hợp đồng, giao dịch và audit.

### NFR-03 Reliability

- Transaction DB bảo vệ các thao tác giữ xe, tạo hợp đồng, trả xe và ghi nhận thanh toán.
- Backup hằng ngày; phải diễn tập restore trước go-live.

### NFR-04 Usability and Accessibility

- Các tác vụ chính dùng được ở viewport điện thoại 360 px trở lên.
- Mục tiêu WCAG 2.2 AA cho contrast, focus và keyboard navigation.
- Trạng thái không chỉ phân biệt bằng màu.

### NFR-05 Compatibility

- Hai phiên bản gần nhất của Chrome, Safari, Edge và Firefox tại thời điểm phát hành.

### NFR-06 Maintainability

- TypeScript strict, migrations có version, module boundaries và CI bắt buộc.
- Logic nghiệp vụ cốt lõi có unit/integration test; coverage mục tiêu tối thiểu 80%.

### NFR-07 Localization

- Chuỗi UI không hardcode trong component; hỗ trợ Việt–Anh từ Sprint 1.
- Báo cáo và thời gian dùng múi giờ `Asia/Ho_Chi_Minh`.

### NFR-08 Auditability

- Mọi override giá, miễn/giảm phí, hủy hợp đồng và thay đổi quyền đều có actor, timestamp, lý do và before/after.

## 5. Key Business Rules

- BR-01 Một xe không được có hai dòng hợp đồng active chồng thời gian.
- BR-02 Trạng thái xe phải nhất quán với lịch active và tình trạng sửa chữa.
- BR-03 Hợp đồng chỉ hoàn tất khi mọi dòng xe đã được trả/hủy hợp lệ.
- BR-04 Tổng còn thu = tổng charge − payment hợp lệ + refund/adjustment theo dấu.
- BR-05 Bảng giá được snapshot khi lập/gia hạn hợp đồng.
- BR-06 Override tiền bắt buộc có lý do; Nhân viên không tự miễn/giảm phí trễ.
- BR-07 Hủy không phải xóa; bản ghi tài chính và audit là bất biến.
- BR-08 Nhân viên không xem hợp đồng người khác hoặc tổng doanh thu nếu không được phép.

## 6. Acceptance and Release Gates

- Sprint 0: người dùng duyệt design direction, tech stack, team, wireframes và BDD Sprint 1.
- Sprint 1: build/lint/test xanh, code review LGTM, QA approved và browser acceptance test trên desktop/mobile.
- Sprint 2 trở đi: chỉ mở sau khi người dùng duyệt UI Sprint 1.

## 7. Open Requirements

Các quyết định PD-04 đến PD-09 trong `.project/project-context.md` phải được chốt trước sprint nghiệp vụ liên quan. PD-10 và PD-11 đã có file tham chiếu riêng tư cho báo cáo doanh thu và lịch trả xe. Chúng không chặn việc tạo UI preview, nhưng các quyết định còn mở vẫn chặn triển khai logic giá, availability, migration và báo cáo production.
