## Epic A — UI Foundation and Access

### US-001 — Đăng nhập

**As a** Chủ hoặc Nhân viên  
**I want to** đăng nhập an toàn  
**So that** tôi chỉ truy cập được dữ liệu phù hợp với vai trò.

```gherkin
Scenario: Đăng nhập thành công
  Given tài khoản đang hoạt động
  When người dùng nhập đúng thông tin đăng nhập
  Then hệ thống mở dashboard phù hợp với vai trò

Scenario: Tài khoản đã bị khóa
  Given nhân viên có trạng thái đã nghỉ hoặc tài khoản bị khóa
  When nhân viên đăng nhập
  Then hệ thống từ chối truy cập và không làm mất lịch sử cũ
```

**Priority:** MUST · **Target:** Sprint 1 · **Points:** 5

### US-002 — App shell responsive

**As a** nhân viên vận hành  
**I want to** dùng cùng một giao diện trên máy tính và điện thoại  
**So that** tôi có thể thao tác tại quầy hoặc khi giao xe.

```gherkin
Scenario: Điều hướng trên điện thoại
  Given viewport rộng 360 px
  When người dùng mở ứng dụng
  Then navigation chính dễ chạm và không có nội dung bị tràn ngang

Scenario: Trạng thái trang
  Given dữ liệu đang tải, rỗng hoặc lỗi
  When màn hình được hiển thị
  Then người dùng thấy trạng thái và hành động tiếp theo rõ ràng
```

**Priority:** MUST · **Target:** Sprint 1 · **Points:** 8

### US-003 — Dashboard vận hành hôm nay

**As a** nhân viên  
**I want to** thấy xe phải trả, quá hạn và hợp đồng cần xử lý  
**So that** tôi ưu tiên công việc trong ngày.

```gherkin
Scenario: Xem dashboard demo Sprint 1
  Given người dùng đã đăng nhập
  When mở dashboard
  Then thấy KPI xe sẵn sàng, đang thuê, trả hôm nay và quá hạn
  And mọi dữ liệu mẫu được ghi nhãn là dữ liệu demo
```

**Priority:** MUST · **Target:** Sprint 1 · **Points:** 5

### US-004 — Navigation theo quyền

**As a** Nhân viên  
**I want to** không thấy chức năng quản trị và doanh thu tổng  
**So that** giao diện đơn giản và đúng quyền.

```gherkin
Scenario: Nhân viên mở trang chỉ dành cho Chủ
  Given người dùng có vai trò Nhân viên
  When truy cập trực tiếp URL quản trị
  Then hệ thống hiển thị access denied
```

**Priority:** MUST · **Target:** Sprint 1 · **Points:** 5

### US-005 — Chuyển ngôn ngữ

**As a** người dùng  
**I want to** chuyển giữa Tiếng Việt và English  
**So that** ứng dụng và hợp đồng phục vụ được khách quốc tế.

```gherkin
Scenario: Chuyển ngôn ngữ UI
  Given giao diện đang ở Tiếng Việt
  When người dùng chọn English
  Then navigation và nhãn giao diện Sprint 1 đổi sang English
  And lựa chọn được giữ khi chuyển trang
```

**Priority:** MUST · **Target:** Sprint 1 · **Points:** 3

