## Epic B — Employees and Configuration

### US-006 — Quản lý nhân viên

**As a** Chủ  
**I want to** tạo, khóa và reset tài khoản nhân viên  
**So that** tôi kiểm soát quyền truy cập.

```gherkin
Scenario: Khóa nhân viên đã nghỉ
  Given nhân viên đang hoạt động
  When Chủ chuyển trạng thái sang đã nghỉ
  Then phiên đăng nhập bị vô hiệu hóa
  And lịch sử thao tác vẫn được giữ
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-007 — Quản lý danh mục và giá

**As a** Chủ  
**I want to** tự cấu hình loại xe, nhãn, giấy tờ và bảng giá  
**So that** nghiệp vụ thay đổi không cần sửa mã nguồn.

```gherkin
Scenario: Thay đổi bảng giá
  Given đã tồn tại hợp đồng cũ
  When Chủ cập nhật giá thuê
  Then hợp đồng mới dùng giá mới
  And hợp đồng cũ giữ giá snapshot ban đầu
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

