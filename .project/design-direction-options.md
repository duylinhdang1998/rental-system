# Sprint 0 — Design Direction Options

**Decision:** UI 3 — Soft Modern selected by the client on 2026-08-31.

Ảnh so sánh đã được tạo tại `.project/design-previews/`:

- `01-operational-minimal.png`
- `02-warm-hospitality.png`
- `03-soft-modern.png`

## 1. Operational Minimal — Recommended

**Vibe:** Gọn, sáng, chuyên nghiệp, hơi hướng Linear/Vercel nhưng thân thiện với nghiệp vụ vận hành.

- Nền trắng/xám rất nhạt, primary xanh dương.
- Màu trạng thái rõ: xanh lá sẵn sàng, xanh dương đang thuê, tím đặt trước, cam sắp/trễ, đỏ quá hạn/hư hỏng.
- Bảng dữ liệu tương đối gọn trên desktop; chuyển thành card dễ chạm trên mobile.
- Bo góc vừa phải, shadow nhẹ, typography Inter/Geist dễ đọc.
- Phù hợp nhất khi nhân viên cần quét nhanh nhiều xe/hợp đồng trong ngày.

## 2. Warm Hospitality

**Vibe:** Ấm, gần gũi với ngành du lịch và dịch vụ; nền cát, olive và terracotta.

- Cảm giác thân thiện hơn khi làm việc với khách du lịch.
- Card rộng, khoảng thở nhiều, hình ảnh xe nổi bật.
- Ít “phần mềm quản trị” hơn nhưng màn hình nhiều dữ liệu sẽ thoáng và dài hơn.
- Phù hợp nếu thương hiệu cửa hàng ưu tiên cảm giác boutique/hospitality.

## 3. Soft Modern — Selected

**Vibe:** Trẻ, mềm và dễ tiếp cận; pastel tím/xanh mint, bo góc lớn.

- Onboarding và tác vụ đơn giản có cảm giác nhẹ nhàng.
- Nút và card lớn, rất phù hợp thao tác cảm ứng.
- Mật độ dữ liệu thấp hơn; dashboard có thể cần cuộn nhiều hơn.
- Phù hợp nếu muốn sản phẩm giống consumer app hơn back-office dashboard.

## Implemented direction

Design system and wireframes are now in `.project/design-system.md` and `.project/wireframes/`. The implementation name is **Soft Modern Operations** to preserve the selected visual while keeping operational contrast and information density.
