## Epic D — Contracts

### US-010 — Lập hợp đồng nhiều xe

**As a** nhân viên  
**I want to** thêm nhiều xe vào một hợp đồng  
**So that** một lượt khách chỉ cần một hồ sơ thuê.

```gherkin
Scenario: Chọn nhiều xe không trùng lịch
  Given khách và khoảng thuê đã được nhập
  When nhân viên chọn nhiều xe sẵn sàng
  Then hệ thống tạo các dòng xe riêng trong cùng hợp đồng
  And tính thành tiền từng xe và tổng hợp đồng
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 13

### US-011 — Chặn xe trùng lịch

**As a** nhân viên  
**I want to** chỉ chọn xe không bận trong khoảng thuê  
**So that** không xảy ra double booking.

```gherkin
Scenario: Xe bị trùng khoảng thời gian
  Given xe đã có booking active giao nhau với khoảng mới
  When nhân viên tìm xe
  Then xe không thể được chọn
  And hệ thống giải thích khoảng thời gian bị trùng
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-012 — Áp giá và override

**As a** nhân viên  
**I want to** hệ thống tự áp giá theo ngày và nhãn khách  
**So that** báo giá nhanh và nhất quán.

```gherkin
Scenario: Sửa giá thủ công
  Given hệ thống đã tính giá mặc định
  When người có quyền nhập giá khác
  Then hệ thống yêu cầu lý do
  And audit lưu giá cũ, giá mới và người sửa
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-013 — Ghi nhận bàn giao và xuất PDF

**As a** nhân viên  
**I want to** lưu cọc, giấy tờ, ảnh, mức xăng và xuất PDF  
**So that** hai bên có bằng chứng bàn giao.

```gherkin
Scenario: Xuất hợp đồng song ngữ
  Given hợp đồng hợp lệ và có ít nhất một xe
  When nhân viên chọn Xuất PDF
  Then hệ thống tạo PDF Việt–Anh theo mẫu đã duyệt
  And PDF hiển thị chính sách trả trễ đã chụp của hợp đồng
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-014 — Gia hạn hợp đồng

**As a** nhân viên  
**I want to** gia hạn và tính lại giá  
**So that** khách tiếp tục thuê mà không tạo hợp đồng rời.

```gherkin
Scenario: Gia hạn hợp lệ
  Given xe không bị booking khác trong khoảng gia hạn
  When nhân viên xác nhận ngày trả mới
  Then hệ thống tính lại giá theo quy tắc đã duyệt
  And lưu lịch sử trước và sau gia hạn
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-015 — Đổi xe giữa chừng

**As a** nhân viên  
**I want to** thay xe khi xe hỏng hoặc khách đổi loại  
**So that** chuyến thuê tiếp tục và lịch sử không bị mất.

```gherkin
Scenario: Đổi xe
  Given hợp đồng đang thuê và xe thay thế sẵn sàng
  When nhân viên xác nhận đổi xe cùng lý do
  Then dòng xe cũ được kết thúc
  And dòng xe mới được tạo và liên kết với dòng cũ
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8
