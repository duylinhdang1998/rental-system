# Hướng dẫn vận hành — Hệ thống quản lý cho thuê xe máy

**Dành cho:** Chủ cửa hàng và Nhân viên.  
**Phiên bản:** Sprint 11 (2026-09-18). Giao diện Việt–Anh, dùng được trên điện thoại và máy tính.

## 1. Đăng nhập và tài khoản

- Mở địa chỉ hệ thống, nhập tên đăng nhập và mật khẩu. Sau 5 lần sai, tài khoản bị chặn
  đăng nhập 15 phút.
- Chủ tạo tài khoản cho Nhân viên tại **Nhân viên → Thêm nhân viên** (tên đăng nhập 3–80 ký
  tự chữ thường/số/dấu chấm/gạch; mật khẩu tối thiểu 10 ký tự).
- **Khóa** một tài khoản sẽ chấm dứt phiên làm việc ngay lập tức; lịch sử hợp đồng, thu tiền
  vẫn giữ tên người đó. **Mở khóa** để cho làm việc lại. Chủ không thể tự khóa mình.
- **Đặt lại mật khẩu**: mật khẩu cũ hết hiệu lực và nhân viên phải đăng nhập lại.
- Đổi ngôn ngữ bằng nút **English / Tiếng Việt** ở góc trên; lựa chọn được ghi nhớ trên thiết bị.

## 2. Công việc hằng ngày của Nhân viên

1. **Tổng quan**: xem xe cần giao, xe cần nhận và hợp đồng quá hạn trong ngày.
2. **Xe**: kiểm tra trạng thái (sẵn sàng, đang thuê, bảo dưỡng); lịch xe cho biết khoảng
   thời gian còn trống.
3. **Khách hàng**: tìm theo tên hoặc số điện thoại; giấy tờ giữ lại được ghi trên hợp đồng.
4. **Hợp đồng → Tạo hợp đồng**: chọn khách, chọn xe (nhiều xe cùng lúc), thời gian thuê, cọc
   và giấy tờ, ảnh bàn giao, xác nhận. Giá tính tự động theo bậc ngày; chỉ Chủ được sửa giá và
   phải ghi lý do.
5. **Bàn giao xe** khi khách nhận; **Gia hạn** hoặc **Đổi xe** khi cần.
6. **Trả xe**: nhận từng xe, ghi tình trạng và phí trễ (tự tính theo quy tắc đã cấu hình);
   thêm phụ phí hỏng hóc nếu có; **Tất toán** khi trả hết xe.
7. **Thu tiền**: ghi từng lần thu (tiền mặt hoặc chuyển khoản), có thể thu nhiều lần; hoàn tiền
   cũng ghi thành một dòng riêng. Không sửa/xóa dòng đã ghi.
8. **Công nợ**: danh sách hợp đồng còn phải thu, cũ nhất lên trước.
9. **Chi phí → Ghi chi phí**: chọn nhóm (xăng, bảo dưỡng, bảo hiểm, đăng kiểm, lương, mặt
   bằng, điện nước, khác), số tiền, tiền mặt hay chuyển khoản, ngày chi, nội dung; gắn xe nếu
   khoản chi thuộc một xe cụ thể (để trống là chi chung). Khoản chi đã ghi không sửa/xóa; ghi
   nhầm thì báo Chủ để đảo. Lọc theo ngày, nhóm và xe; bốn ô tổng ở đầu trang theo bộ lọc.

## 3. Việc của Chủ cửa hàng

- **Báo cáo**: doanh thu theo ngày, theo nhân viên, theo hợp đồng và tuổi nợ; **Xuất Excel**
  theo mẫu 14 cột. Chỉ Chủ xem được.
- **Nhật ký**: ai đã làm gì, lúc nào. Lọc theo loại bản ghi, thao tác và ngày. Sửa giá hiển thị
  lý do, giá cũ và giá mới; khóa tài khoản và đặt lại mật khẩu cũng được ghi (không lưu mật khẩu).
- **Cài đặt**: quy tắc trả trễ (số phút miễn phí, mức phí theo giờ) áp dụng cho hợp đồng mới.
- **Nhân viên**: tạo, khóa, mở khóa, đặt lại mật khẩu.
- **Giá vốn** (nút trên từng xe ở trang **Xe**): nhập giá mua, ngày mua, số tháng sử dụng
  (mặc định 36) và giá trị thanh lý. Hệ thống xem trước khấu hao mỗi tháng, khấu hao lũy kế
  và giá trị còn lại tính đến hôm nay trước khi lưu; mỗi lần đổi giá đều vào Nhật ký.
- **Đảo khoản chi** (nút **Đảo** trên trang **Chi phí**): ghi lý do; hệ thống tạo một dòng đảo
  cùng số tiền, khoản gốc hiện "Đã đảo". Không có cách nào sửa hay xóa dòng đã ghi.
- **Báo cáo → Đội xe** (Hiệu quả đội xe): chọn ngày tính; mỗi xe hiện giá vốn, khấu hao/tháng,
  giá trị còn lại, doanh thu, ngày cho thuê, chi phí, ròng, % thu hồi và dự báo hòa vốn
  ("Đã hòa vốn", "Dự kiến <ngày>", "Chưa dự báo được" khi 90 ngày gần nhất lỗ, "Chưa có giá
  vốn"). Dòng **Chưa phân bổ** gom phí giao xe, phụ phí chung và chi phí không gắn xe; dòng
  **Tổng** khớp bốn ô đầu trang. **Xuất Excel** ra sheet "Đội xe". Doanh thu ở đây tính theo
  từng xe trong hợp đồng (kể cả chưa thu tiền); muốn xem tiền đã thu theo ngày thì dùng tab
  **Doanh thu**.

## 4. Khi có sự cố

- Nếu màn hình báo "Quá nhiều yêu cầu, vui lòng thử lại sau": đợi một phút rồi thao tác lại.
- Nếu không đăng nhập được với thông báo "Tài khoản hiện không thể truy cập": liên hệ Chủ để
  mở khóa.
- Nếu hệ thống báo lỗi kèm mã yêu cầu (`req_…`), gửi mã đó cho bộ phận kỹ thuật.
- Dữ liệu được sao lưu hằng đêm; bộ phận kỹ thuật diễn tập khôi phục hằng tuần. Không nhập lại
  dữ liệu thủ công trước khi kỹ thuật xác nhận.

## 5. Bài tập đào tạo (mỗi người làm xong trước ngày go-live)

| # | Vai trò | Bài tập | Kết quả mong đợi |
|---|---|---|---|
| 1 | Nhân viên | Tạo hợp đồng 2 xe cho khách mẫu, bàn giao, thu cọc | Hợp đồng ở trạng thái đang thuê, sổ thanh toán có 1 dòng |
| 2 | Nhân viên | Nhận 1 xe trễ 90 phút, thêm phụ phí, nhận xe còn lại, tất toán | Phí trễ tự tính, hợp đồng hoàn tất, công nợ hiển thị đúng |
| 3 | Nhân viên | Thu nốt công nợ bằng chuyển khoản, có mã tham chiếu | Còn phải thu 0 ₫ |
| 4 | Chủ | Sửa giá một xe với lý do, xem Nhật ký | Nhật ký ghi lý do, giá cũ, giá mới |
| 5 | Chủ | Tạo tài khoản nhân viên mới, khóa rồi mở khóa | Nhân viên đăng nhập được sau khi mở khóa |
| 6 | Chủ | Xuất Excel doanh thu của ngày | File `doanh-thu-<từ>-<đến>.xlsx` mở được, 14 cột, có dòng tổng |
