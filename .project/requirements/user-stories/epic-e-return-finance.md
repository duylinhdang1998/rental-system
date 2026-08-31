## Epic E — Return, Settlement and Finance

### US-016 — Trả lẻ từng xe

**As a** nhân viên nhận trả  
**I want to** trả riêng từng xe trong hợp đồng  
**So that** hợp đồng nhiều xe phản ánh đúng vận hành.

```gherkin
Scenario: Trả một trong nhiều xe
  Given hợp đồng có hai xe đang thuê
  When nhân viên trả xe thứ nhất
  Then xe thứ nhất có trạng thái trả
  And hợp đồng vẫn đang thuê cho đến khi xe còn lại hoàn tất
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 13

### US-017 — Tất toán

**As a** nhân viên  
**I want to** thấy bảng tính tiền thuê, phụ phí, đã thu và số dư  
**So that** tôi thu hoặc hoàn đúng tiền.

```gherkin
Scenario: Tính số còn thu
  Given hợp đồng có tiền thuê, phí trễ và các khoản đã thu
  When mở bảng tất toán
  Then số còn thu bằng tổng charge trừ payment hợp lệ
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

### US-018 — Thu nhiều lần và nhiều hình thức

**As a** nhân viên  
**I want to** ghi nhiều khoản thu tiền mặt/chuyển khoản  
**So that** công nợ luôn đúng.

```gherkin
Scenario: Thu kết hợp
  Given hợp đồng còn nợ
  When nhân viên ghi một khoản tiền mặt và một khoản chuyển khoản
  Then cả hai giao dịch được lưu riêng
  And số còn thiếu được cập nhật chính xác
```

**Priority:** MUST · **Target:** Post Sprint 1 · **Points:** 8

