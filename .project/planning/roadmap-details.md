# Chi tiết công việc theo Sprint


### Sprint 0 — Discovery, SRS và thiết kế

- Phỏng vấn Chủ và ít nhất một Nhân viên về quy trình hiện tại.
- Chuẩn hóa 83 mã chức năng, thuật ngữ và trạng thái.
- Chốt 7 quy tắc còn mơ hồ tại mục 2.
- Thu thập mẫu hợp đồng Việt–Anh, file báo cáo doanh thu hiện tại và file dữ liệu cũ.
- Viết SRS, scope, user stories, acceptance criteria và ma trận truy vết.
- Thiết kế wireframe cho: đăng nhập, dashboard hôm nay, xe, khách, lập hợp đồng, hợp đồng chi tiết, nhận trả, thanh toán, công nợ, báo cáo, cấu hình.
- Chốt design system mobile-first và prototype luồng lập–trả hợp đồng.
- Chốt mô hình dữ liệu, API, bảo mật, backup và chiến lược triển khai.

### Sprint 1 — Nền tảng hệ thống

- Khởi tạo ứng dụng, database migrations, seed và môi trường.
- Đăng nhập/đăng xuất, session, đổi/reset mật khẩu, khóa tài khoản.
- RBAC Chủ/Nhân viên đúng ma trận workbook; hạn chế theo hợp đồng người lập.
- Hồ sơ nhân viên và trạng thái đang làm/đã nghỉ.
- Audit log giá trị cũ–mới cho thao tác nhạy cảm.
- Quản lý file riêng tư; nền tảng Việt–Anh và responsive.
- CI/CD, staging, log lỗi và sao lưu tự động bản đầu.

### Sprint 2 — Xe, khách hàng và danh mục

- CRUD xe, loại xe, ảnh và trạng thái.
- Tìm/lọc, lịch sử trạng thái và khung lịch sử thuê/doanh thu.
- CRUD khách, nhiều kênh liên hệ, giấy tờ, tìm khách cũ.
- Nhãn màu, blacklist và cảnh báo; lịch sử thuê/thống kê nền.
- Danh mục giấy tờ, đối tác giới thiệu và thông tin hộ kinh doanh.

### Sprint 3 — Bảng giá và lập hợp đồng

- Giá theo loại xe và bậc ngày; giá riêng theo nhãn khách.
- Mã hợp đồng tự sinh và kiểm tra trùng lịch xe.
- Một hợp đồng nhiều xe; tính ngày, đơn giá, thành tiền và tổng.
- Override giá có lý do và audit.
- Cọc, giấy tờ giữ, giao tại tiệm/tận nơi, phí giao.
- Ảnh giao xe, mức xăng, ghi chú, nhân viên phụ trách.
- In/xuất hợp đồng PDF song ngữ.

### Sprint 4 — Vòng đời hợp đồng

- State machine: Đặt trước → Đang thuê → Quá hạn → Đã trả; nhánh Hủy.
- Tự động đánh dấu quá hạn và cập nhật trạng thái xe.
- Hủy hợp đồng có người/lý do.
- Gia hạn có kiểm tra lịch và tính lại giá.
- Đổi xe giữa chừng không mất lịch sử.
- Dashboard xe trả hôm nay và danh sách quá hạn theo số giờ.

### Sprint 5 — Nhận trả và tất toán

- Trả từng xe; hợp đồng đóng khi đã xử lý toàn bộ xe.
- Tính phí trễ cấu hình được; phí hư hỏng/khác ở dạng khoản thu có lý do.
- Bảng tất toán và số còn thu/cần hoàn.
- Xác nhận trả giấy tờ/cọc; ghi nhân viên nhận trả.
- Đưa xe về Sẵn sàng hoặc Sửa chữa theo tình trạng.
- Lịch sử đầy đủ để đối chiếu tranh chấp.

### Sprint 6 — Thanh toán, công nợ và báo cáo

- Thu tiền mặt/chuyển khoản/kết hợp; nhiều giao dịch trên một hợp đồng.
- Phân bổ khoản thu, số còn thiếu và tuổi nợ.
- Tổng thu trong ngày theo hình thức.
- Báo cáo doanh thu ngày/kỳ, công nợ và hiệu suất nhân viên.
- Xuất Excel khớp mẫu được duyệt.
- Quyền xem số liệu tổng hợp chỉ dành cho Chủ.

### Sprint 7 — Ổn định và phát hành

- Rà soát toàn bộ màn hình trên điện thoại và desktop.
- Hoàn thiện bản dịch Việt–Anh và mẫu in.
- Kiểm thử phân quyền, OWASP, tải, backup và khôi phục.
- UAT theo các hành trình: lập hợp đồng, gia hạn/đổi xe, trả lẻ, tất toán, thu tiền, xem báo cáo.
- Chuẩn bị dữ liệu danh mục ban đầu; nhập dữ liệu lịch sử nếu được đưa vào MVP.
- Đào tạo Chủ/Nhân viên, hướng dẫn vận hành và phương án rollback.
- Theo dõi sau go-live và sửa lỗi ưu tiên cao.

