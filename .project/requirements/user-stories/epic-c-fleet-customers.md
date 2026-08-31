## Epic C — Fleet and Customers

### US-008 — Quản lý xe

**As a** nhân viên  
**I want to** tìm và lọc xe theo trạng thái/loại  
**So that** tôi biết xe nào có thể cho thuê.

```gherkin
Scenario: Lọc xe sẵn sàng
  Given danh sách có nhiều trạng thái xe
  When chọn bộ lọc Sẵn sàng
  Then chỉ các xe hợp lệ được hiển thị
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-009 — Quản lý khách hàng

**As a** nhân viên  
**I want to** tìm khách cũ bằng tên hoặc kênh liên hệ  
**So that** tôi không tạo hồ sơ trùng.

```gherkin
Scenario: Tìm khách blacklist
  Given khách có nhãn cần cảnh giác và lý do
  When nhân viên tìm khách để lập hợp đồng
  Then hệ thống hiển thị cảnh báo đỏ và lý do
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

