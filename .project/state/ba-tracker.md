# Requirements Gathering Tracker

**Project:** Hệ thống quản lý cho thuê xe máy  
**BA:** Business Analyst  
**Started:** 2026-08-31  
**Status:** APPROVED_BASELINE_WITH_LATER_SPRINT_DECISIONS_PENDING

## Session Overview

**Total Requirements Categories:** 11  
**Total Source Functional Features:** 83  
**Total Non-Functional Requirements:** 8  
**Total User Stories:** 20  
**Completion:** 95%

## Client Requirements

| # | Requirement | Source | Priority |
|---|---|---|---|
| CR-01 | Quản lý nhân viên và vai trò Chủ/Nhân viên | Workbook | P1 |
| CR-02 | Quản lý xe, trạng thái, lịch sử và doanh thu | Workbook | P1/P2 |
| CR-03 | Quản lý khách, giấy tờ, nhãn và blacklist | Workbook | P1 |
| CR-04 | Hợp đồng một khách nhiều xe | Workbook | P1 |
| CR-05 | Giá theo bậc ngày, override có lý do | Workbook | P1 |
| CR-06 | Hợp đồng có cọc, giấy tờ, giao xe, ảnh và PDF song ngữ | Workbook | P1 |
| CR-07 | Vòng đời, gia hạn, đổi xe và hủy | Workbook | P1 |
| CR-08 | Trả lẻ, phụ phí và tất toán | Workbook | P1/P2 |
| CR-09 | Thu nhiều lần, công nợ và tổng thu ngày | Workbook | P1/P2 |
| CR-10 | Báo cáo cơ bản và nâng cao | Workbook | P1/P2 |
| CR-11 | Audit, mobile, i18n, backup và import | Workbook | P1/P2 |
| CR-12 | Thực hiện Sprint 0–1 để duyệt UI trước các sprint sau | Client message | MUST |
| CR-13 | Phí trả trễ cấu hình được; mặc định miễn 60 phút, sau đó 20.000 VND mỗi giờ bắt đầu | Client message | MUST |

## Discovery Questions

| # | Question | Answer | Date |
|---|---|---|---|
| Q1 | Một hay nhiều chi nhánh? | Một chi nhánh trong MVP | 2026-09-01 |
| Q2 | Cách tính ngày thuê/giờ trễ? | Dự kiến theo block 24 giờ; trả thực tế miễn 60 phút, từ phút 61 tính 20.000 VND mỗi giờ bắt đầu; Chủ cấu hình được | 2026-09-01 |
| Q3 | Gia hạn tính lại giá thế nào? | Pending; draft assumes full-period repricing | 2026-08-31 |
| Q4 | Đặt trước xe đang thuê nếu không trùng lịch? | Pending; draft recommends yes | 2026-08-31 |
| Q5 | Import Excel cũ có thuộc MVP? | Pending | 2026-08-31 |
| Q6 | Mẫu hợp đồng và báo cáo hiện tại? | Duyệt mẫu PDF hệ thống cho bản đầu; thay khi nhận mẫu riêng. Đã nhận báo cáo doanh thu + lịch trả xe | 2026-09-01 |
| Q7 | Phong cách UI nào? | UI 3 — Soft Modern Operations | 2026-08-31 |

## Key Decisions & Design Choices

| Decision | Rationale | Date | Approved By |
|---|---|---|---|
| Sprint 1 ưu tiên UI preview | Người dùng muốn duyệt UI trước phần còn lại | 2026-08-31 | Client |
| Sprint 2+ tạm dừng sau Sprint 1 | Cho phép thay đổi UI sớm với chi phí thấp | 2026-08-31 | Client |
| Dùng dữ liệu demo có nhãn trong Sprint 1 | Tạo preview mà không giả vờ nghiệp vụ đã hoàn thành | 2026-08-31 | Draft |
| Chọn UI 3 — Soft Modern Operations | Phù hợp dashboard vận hành, thân thiện và responsive | 2026-08-31 | Client |
| Lưu workbook khách hàng trong vùng private | File chứa PII; chỉ dùng để tạo fixture ẩn danh và xác nhận format | 2026-08-31 | Client |
| Snapshot chính sách trả trễ theo từng xe hợp đồng | Nhiều xe có thể trả riêng; đổi cấu hình không được làm sai hợp đồng cũ | 2026-09-01 | Client |
| Dùng PDF hệ thống cho bản đầu | Có tài liệu vận hành ngay và thay mẫu sau khi khách hàng cung cấp | 2026-09-01 | Client |

## Deliverables

- [x] Requirements extracted from workbook
- [x] Scope document created
- [x] SRS draft created
- [x] User stories with Given/When/Then created
- [x] MoSCoW/priority mapping completed
- [x] Client revenue/return workbook samples cataloged privately
- [ ] Client answers pending decisions
- [ ] Requirements sign-off
- [ ] Hand off to approved UX/CTO plan

**Last Updated:** 2026-09-01
**Phase Status:** SPRINT_0_3_BASELINE_APPROVED — later-sprint rules remain pending
