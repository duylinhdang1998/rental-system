## Epic I — Asset and Finance Optimisation (Phase 2)

Priority 2 scope from `implementation-plan.md` §3.2, planned in
`planning/phase-2-roadmap.md`. All money is integer VND; financial records stay append-only
(BR-07) and corrections are reversal entries (BR-09). Revenue aggregates remain Owner-only
(BR-08).

### US-023 — Giá vốn và khấu hao xe

**As a** Chủ  
**I want to** ghi giá mua, ngày mua, số tháng sử dụng và giá trị thanh lý của từng xe  
**So that** hệ thống tính khấu hao đường thẳng và giá trị còn lại của xe tại mọi thời điểm.

```gherkin
Scenario: Ghi giá vốn cho xe
  Given xe "XE-001" chưa có giá vốn
  When Chủ ghi giá mua 30000000, ngày mua 2026-01-15, 36 tháng sử dụng, thanh lý 3000000
  Then khấu hao mỗi tháng là 750000
  And tại ngày 2026-09-18 đã khấu hao 8 tháng = 6000000 và giá trị còn lại 24000000
  And nhật ký ghi VEHICLE_ACQUISITION_SET với giá cũ và giá mới

Scenario: Nhân viên không sửa giá vốn
  Given phiên Nhân viên
  When Nhân viên gửi giá vốn cho xe
  Then API trả về 403
```

**Priority:** SHOULD · **Target:** Sprint 11 · **Points:** 5

### US-024 — Quản lý chi

**As a** Chủ hoặc Nhân viên  
**I want to** ghi các khoản chi (bảo dưỡng, xăng, bảo hiểm, mặt bằng, lương…) theo xe hoặc
chung  
**So that** mọi đồng chi ra được truy vết và đối chiếu với doanh thu.

```gherkin
Scenario: Ghi khoản chi cho xe
  Given xe "XE-001" đang hoạt động
  When Nhân viên ghi chi BẢO DƯỠNG 250000 tiền mặt ngày 2026-09-10 cho xe "XE-001"
  Then sổ chi có một dòng với người ghi, hình thức, ngày và mã xe
  And gửi lại cùng khóa idempotency không tạo dòng thứ hai

Scenario: Chủ sửa sai bằng bút toán đảo
  Given khoản chi 250000 đã ghi
  When Chủ đảo khoản chi với lý do "Nhập nhầm xe"
  Then sổ chi có thêm một dòng đảo cùng số tiền và khoản gốc được đánh dấu đã đảo
  And tổng chi ròng không còn tính khoản này
  And không có API sửa hoặc xóa khoản chi
```

**Priority:** SHOULD · **Target:** Sprint 11 · **Points:** 8

### US-025 — Hiệu quả và điểm hòa vốn từng xe

**As a** Chủ  
**I want to** xem mỗi xe đã thu bao nhiêu, chi bao nhiêu, còn giá trị bao nhiêu và khi nào hòa
vốn  
**So that** tôi quyết định giữ, bán hay mua thêm xe.

```gherkin
Scenario: Báo cáo hiệu quả đội xe
  Given xe "XE-001" giá vốn 30000000, doanh thu dòng xe 12000000 và chi 2000000
  When Chủ mở báo cáo hiệu quả đội xe tại ngày hôm nay
  Then dòng xe hiển thị doanh thu 12000000, chi 2000000, đóng góp ròng 10000000
  And đã thu hồi 33% giá vốn và dự kiến hòa vốn theo tốc độ 90 ngày gần nhất
  And phí giao xe và phụ phí/giảm trừ cấp hợp đồng nằm ở dòng "Chưa phân bổ"
  And Nhân viên nhận 403 khi gọi báo cáo này
```

**Priority:** SHOULD · **Target:** Sprint 11 · **Points:** 8

### US-026 — Danh mục hư hỏng và bảng giá

**As a** Chủ  
**I want to** cấu hình danh mục hư hỏng kèm giá đền bù  
**So that** Nhân viên chọn đúng mục khi nhận xe thay vì tự gõ giá.

**Priority:** SHOULD · **Target:** Sprint 12 · **Points:** 5

### US-027 — Chốt ca tiền mặt

**As a** Nhân viên  
**I want to** mở ca, xem tiền mặt phải có và nhập tiền đếm được khi đóng ca  
**So that** chênh lệch tiền mặt được ghi nhận ngay và Chủ kiểm tra được từng ca.

**Priority:** SHOULD · **Target:** Sprint 12 · **Points:** 8

### US-028 — Ảnh nhận xe và hoàn cọc

**As a** Nhân viên  
**I want to** tải ảnh xe lúc nhận về và hoàn cọc bằng một thao tác  
**So that** tranh chấp có bằng chứng và tiền cọc trả lại được ghi vào sổ.

**Priority:** SHOULD · **Target:** Sprint 12 · **Points:** 5

### US-029 — Báo cáo doanh thu đa chiều, tỷ lệ sử dụng và lãi/lỗ

**As a** Chủ  
**I want to** xem doanh thu theo loại xe, xe, tháng; phụ phí; tỷ lệ sử dụng và lãi/lỗ  
**So that** tôi tối ưu đội xe và bảng giá.

**Priority:** SHOULD · **Target:** Sprint 13 · **Points:** 8

### US-030 — Biểu đồ xu hướng

**As a** Chủ  
**I want to** xem biểu đồ 12 tháng cho doanh thu, chi phí và lãi/lỗ  
**So that** tôi thấy xu hướng thay vì chỉ bảng số.

**Priority:** COULD · **Target:** Sprint 13 · **Points:** 5
