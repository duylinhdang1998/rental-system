# Phạm vi sản phẩm

## Mục tiêu phát hành đầu tiên

Tạo web app responsive giúp Chủ và Nhân viên quản lý hoạt động cho thuê xe máy từ lúc tìm khách/chọn xe đến lúc trả xe, tất toán và báo cáo.

## Phạm vi Sprint 0

- Chuẩn hóa yêu cầu, thuật ngữ, trạng thái và mã chức năng.
- Lập SRS, user stories, acceptance criteria và roadmap.
- Chốt tech stack, kiến trúc, file blueprint và đội thực hiện.
- Chọn phong cách UI, tạo design system, wireframes desktop/mobile và user flows.
- Chuẩn bị BDD scenarios cho Sprint 1.

## Phạm vi Sprint 1 — UI Foundation & Preview

Sprint 1 tạo một vertical slice để người dùng xem hình hài sản phẩm trước khi phát triển sâu:

- App shell responsive, sidebar/bottom navigation và header.
- Trang đăng nhập.
- Dashboard vận hành hôm nay.
- Các trang danh sách preview: Xe, Khách hàng, Hợp đồng, Nhận trả, Báo cáo.
- Trang cấu hình và nhân viên preview cho vai trò Chủ.
- Trạng thái loading, empty, error và access denied.
- Chuyển đổi Việt–Anh cơ bản.
- Dữ liệu demo được gắn nhãn rõ; chưa được xem là nghiệp vụ hoàn chỉnh.
- Nền tảng auth/RBAC, testing, CI và cấu trúc ứng dụng để các sprint sau nối dữ liệu thật.

## MVP sau Sprint 1

- Quản lý nhân viên và phân quyền đầy đủ.
- Quản lý xe và khách hàng.
- Bảng giá và lập hợp đồng nhiều xe.
- Vòng đời hợp đồng, gia hạn, đổi xe và hủy.
- Nhận/trả xe, trả lẻ và tất toán.
- Thanh toán, công nợ và báo cáo cơ bản.
- Audit, backup, responsive và Việt–Anh.

## Giai đoạn 2

- Giá vốn, khấu hao và hòa vốn.
- Ảnh nhận xe, bảng giá hư hỏng.
- Chốt ca, hoàn cọc, quản lý chi.
- Báo cáo nâng cao và biểu đồ.
- Nhập dữ liệu Excel cũ nếu không đưa vào MVP.

## Ngoài phạm vi hiện tại

- Native mobile app và offline hoàn toàn.
- Cổng đặt xe công khai.
- Thanh toán online, hóa đơn điện tử và phần mềm kế toán.
- GPS/IoT, đa chi nhánh và thông báo tự động.

## Nguyên tắc quản lý phạm vi

- Sprint 2 trở đi chỉ bắt đầu sau khi UI Sprint 1 được duyệt.
- Chức năng demo trong Sprint 1 không đồng nghĩa nghiệp vụ backend đã hoàn thành.
- Yêu cầu mới phải được đánh giá ảnh hưởng và ghi thành change request.
- Không đưa mục ưu tiên 2 vào MVP giữa sprint nếu không có phê duyệt thay đổi phạm vi.

