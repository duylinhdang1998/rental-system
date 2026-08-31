## Epic F — Reporting and Safety

### US-019 — Báo cáo và xuất Excel

**As a** Chủ  
**I want to** xem doanh thu, công nợ và hiệu suất nhân viên  
**So that** tôi đối soát hoạt động kinh doanh.

```gherkin
Scenario: Xuất báo cáo
  Given Chủ đã chọn khoảng thời gian
  When chọn Xuất Excel
  Then file được tạo theo mẫu đã duyệt
  And số liệu khớp tổng giao dịch trong hệ thống
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-020 — Audit và khôi phục dữ liệu

**As a** Chủ  
**I want to** xem lịch sử thay đổi và có backup khôi phục được  
**So that** dữ liệu vận hành an toàn và truy vết được.

```gherkin
Scenario: Kiểm tra thay đổi nhạy cảm
  Given một người dùng đã sửa giá hợp đồng
  When Chủ xem audit
  Then thấy actor, thời gian, lý do, giá cũ và giá mới

Scenario: Kiểm thử backup
  Given bản backup hằng ngày đã được tạo
  When thực hiện quy trình restore thử nghiệm
  Then dữ liệu kiểm tra được khôi phục và đối chiếu thành công
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

