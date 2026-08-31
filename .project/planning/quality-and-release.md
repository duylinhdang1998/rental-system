# Kiểm thử, vận hành và phát hành


### 8.1 Unit test

- Tính ngày thuê, giá theo bậc và giá theo nhãn.
- Phí trễ, tổng tất toán, số còn thu/cần hoàn.
- Chuyển trạng thái hợp đồng/xe.
- Kiểm tra trùng lịch và trả lẻ.
- Chính sách phân quyền theo vai trò/người lập/thời gian trong ngày.

### 8.2 Integration test

- Giao dịch tạo hợp đồng và giữ nhiều xe phải nguyên tử.
- Ghi nhận payment phải cập nhật đúng số dư và báo cáo.
- Gia hạn/đổi xe/trả xe phải cập nhật lịch sử, availability và audit đồng bộ.
- Upload tệp và quyền truy cập tệp riêng tư.
- Job quá hạn, backup và khôi phục.

### 8.3 E2E/UAT

- Chủ tạo và khóa nhân viên.
- Nhân viên lập hợp đồng nhiều xe cho khách cũ/VIP/blacklist.
- Không thể chọn xe trùng lịch.
- Gia hạn hoặc đổi xe giữa chuyến.
- Trả lẻ từng xe, thêm phí và tất toán.
- Thu nhiều lần bằng nhiều hình thức; công nợ cập nhật đúng.
- Nhân viên không xem/sửa dữ liệu ngoài quyền.
- Chủ xem và xuất báo cáo đúng mẫu.

## 9. Bảo mật và vận hành

- Phân quyền ở API và database access layer, không chỉ ẩn nút trên giao diện.
- Mật khẩu được băm mạnh; rate limit và khóa tạm khi đăng nhập sai nhiều lần.
- Cookie/session bảo mật; CSRF/CSP và validation đầu vào.
- Tệp giấy tờ khách hàng đặt riêng tư; URL tải có thời hạn.
- Audit log dạng append-only cho hợp đồng, giá, thanh toán và phân quyền.
- Không đưa thông tin nhạy cảm vào application log.
- Chống DDoS theo nhiều lớp: CDN/WAF/load balancer chặn trước origin; NestJS thực hiện throttling theo route/user/IP và chống brute force.
- Origin production không mở trực tiếp ra Internet; proxy/body/timeouts/concurrency được giới hạn rõ.
- Backup hằng ngày, mã hóa, retention được cấu hình; diễn tập restore trước go-live và định kỳ.
- Monitoring lỗi, độ trễ API, dung lượng DB/storage và tình trạng backup.

## 10. Nhân sự và trách nhiệm

| Vai trò | Trách nhiệm | Mức tham gia |
|---|---|---:|
| Product Owner — Chủ cửa hàng | Chốt quy tắc, mẫu hợp đồng/báo cáo, duyệt UAT | 2–4 giờ/tuần |
| BA/PM | SRS, backlog, BDD, điều phối, quản lý thay đổi | Xuyên suốt |
| UX Designer | User flow, wireframe, design system, mobile | Sprint 0 và kiểm tra theo sprint |
| Backend/Domain Engineer | Database, API, hợp đồng, tài chính, bảo mật | Toàn thời gian |
| Frontend Engineer | Giao diện vận hành, responsive, i18n, export | Toàn thời gian |
| QA Engineer | BDD, automation, hồi quy, UAT | Bán thời gian sớm; tăng ở Sprint 5–7 |
| Code Reviewer/Security | Review kiến trúc, code, bảo mật | Sau mỗi sprint |
| DevOps | CI/CD, staging/prod, backup, monitoring | Sprint 1 và Sprint 7 |

## 11. Rủi ro chính và giảm thiểu

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Quy tắc giá/ngày thuê chưa rõ gây sai tiền | Cao | Chốt bảng ví dụ vàng và BDD trước Sprint 3 |
| Trạng thái xe lệch với hợp đồng | Cao | State machine, transaction DB, invariant tests và audit |
| Trả lẻ/đổi xe làm mất lịch sử | Cao | Thiết kế theo từng `ContractVehicle`, không ghi đè dòng cũ |
| Sai phân quyền làm lộ doanh thu/giấy tờ | Cao | Authorization server-side, test ma trận quyền, private storage |
| Báo cáo không khớp cách đối soát cũ | Cao | Dùng file mẫu đã nhận để tạo bộ dữ liệu vàng ẩn danh và đối chiếu trước Sprint 6 |
| Mất dữ liệu hoặc backup không dùng được | Cao | Backup tự động + kiểm thử restore, không chỉ kiểm tra file tồn tại |
| Scope MVP quá lớn | Trung bình | Khóa 71 mục P1, quản lý change request và không kéo P2 vào giữa sprint |
| Người dùng thao tác chậm trên điện thoại | Trung bình | Prototype dashboard/lập HĐ/nhận trả từ Sprint 0 và BAT trên thiết bị thật |

## 12. Mốc duyệt và điều kiện go-live

1. **Gate 1 — Planning:** SRS, user stories, wireframe, kiến trúc, roadmap và các giả định được Chủ duyệt.
2. **Gate 2 — Core rental:** Lập hợp đồng nhiều xe, kiểm tra availability và PDF chạy đúng trên staging.
3. **Gate 3 — Settlement:** Trả lẻ, phí, thanh toán và công nợ đối chiếu đúng bằng bộ dữ liệu mẫu.
4. **Gate 4 — UAT:** Tất cả hành trình trọng yếu pass; không còn lỗi Critical/High.
5. **Go-live:** Backup/restore pass, phân quyền pass, dữ liệu ban đầu sẵn sàng, đào tạo hoàn tất và có rollback plan.
